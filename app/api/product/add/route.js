import { v2 as cloudinary } from 'cloudinary'
import { getAuth } from '@clerk/nextjs/server'
import authSeller from '@/lib/authSeller'
import { NextResponse } from 'next/server'
import connectDB from '@/config/db'
import Product from '@/models/Product'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadToCloudinary = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!authSeller(userId)) {
      return NextResponse.json({ success: false, message: 'not authorized' })
    }

    const formData = await request.formData()
    const name = formData.get('name')
    const description = formData.get('description')
    const category = formData.get('category')
    const price = formData.get('price')
    const offerPrice = formData.get('offerPrice')
    const designTemplates = JSON.parse(formData.get('designTemplates'))
    const availableColors = JSON.parse(formData.get('availableColors'))

    const files = formData.getAll('images')
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'no files uploaded' })
    }

    const result = await Promise.all(files.map(uploadToCloudinary))
    const image = result.map((result) => result.secure_url)

    await connectDB()
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image,
      designTemplates,
      availableColors, // Added this line
      date: Date.now(),
    })

    return NextResponse.json({
      success: true,
      message: 'Upload successful',
      newProduct,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message })
  }
}
