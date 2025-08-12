'use client'
import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const colorSwatch = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Ash', hex: '#F3F4F6' },
  { name: 'Silver', hex: '#E5E7EB' },
  { name: 'Dark Grey', hex: '#4B5563' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Mauve', hex: '#D1D5DB' },
  { name: 'Brown', hex: '#7C3AED' },
]

const AddProduct = () => {
  const { getToken } = useAppContext()

  const [files, setFiles] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Earphone')
  const [price, setPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [designTemplates, setDesignTemplates] = useState({
    front: '',
    back: '',
    sleeveRight: '',
    sleeveLeft: '',
  })
  const [selectedColors, setSelectedColors] = useState([])

  const handleTemplateChange = (e, key) => {
    setDesignTemplates((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleColorSelect = (color) => {
    setSelectedColors((prev) =>
      prev.some((c) => c.name === color.name)
        ? prev.filter((c) => c.name !== color.name)
        : [...prev, color]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('name', name)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('price', price)
    formData.append('offerPrice', offerPrice)
    formData.append('designTemplates', JSON.stringify(designTemplates))
    formData.append('availableColors', JSON.stringify(selectedColors))

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    // Append design templates as a JSON string
    formData.append('designTemplates', JSON.stringify(designTemplates))

    try {
      const token = await getToken()

      const { data } = await axios.post('/api/product/add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        toast.success(data.message)
        setFiles([])
        setName('')
        setDescription('')
        setCategory('Earphone')
        setPrice('')
        setOfferPrice('')
        setDesignTemplates({})
        // Reset file inputs visually
        document.getElementById('product-form').reset()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const templateOptions = Object.keys(assets.designTemplates)

  return (
    <div className='flex-1 min-h-screen flex flex-col justify-between'>
      <form
        id='product-form'
        onSubmit={handleSubmit}
        className='md:p-10 p-4 space-y-5 max-w-lg'
      >
        <div>
          <p className='text-base font-medium'>Product Image</p>
          <div className='flex flex-wrap items-center gap-3 mt-2'>
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  onChange={(e) => {
                    const updatedFiles = [...files]
                    updatedFiles[index] = e.target.files[0]
                    setFiles(updatedFiles)
                  }}
                  type='file'
                  id={`image${index}`}
                  hidden
                />
                <Image
                  key={index}
                  className='max-w-24 cursor-pointer'
                  src={
                    files[index]
                      ? URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt=''
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Design Templates Section */}
        <div>
          <p className='text-base font-medium'>Design Templates</p>
          <div className='grid grid-cols-2 gap-4 mt-2'>
            <div>
              <label htmlFor='front-template' className='text-sm'>
                Front Side
              </label>
              <select
                id='front-template'
                onChange={(e) => handleTemplateChange(e, 'front')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='back-template' className='text-sm'>
                Back Side
              </label>
              <select
                id='back-template'
                onChange={(e) => handleTemplateChange(e, 'back')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='sleeveRight-template' className='text-sm'>
                Sleeve Right
              </label>
              <select
                id='sleeveRight-template'
                onChange={(e) => handleTemplateChange(e, 'sleeveRight')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='sleeveLeft-template' className='text-sm'>
                Sleeve Left
              </label>
              <select
                id='sleeveLeft-template'
                onChange={(e) => handleTemplateChange(e, 'sleeveLeft')}
                className='block w-full text-sm text-gray-500 p-2 border rounded'
              >
                <option value=''>None</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-1 max-w-md'>
          <label className='text-base font-medium' htmlFor='product-name'>
            Product Name
          </label>
          <input
            id='product-name'
            type='text'
            placeholder='Type here'
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40'
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className='flex flex-col gap-1 max-w-md'>
          <label
            className='text-base font-medium'
            htmlFor='product-description'
          >
            Product Description
          </label>
          <textarea
            id='product-description'
            rows={4}
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none'
            placeholder='Type here'
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>
        <div className='flex items-center gap-5 flex-wrap'>
          <div className='flex flex-col gap-1 w-32'>
            <label className='text-base font-medium' htmlFor='category'>
              Category
            </label>
            <select
              id='category'
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40'
              onChange={(e) => setCategory(e.target.value)}
              defaultValue={category}
            >
              <option value='Earphone'>Earphone</option>
              <option value='Headphone'>Headphone</option>
              <option value='Watch'>Watch</option>
              <option value='Smartphone'>Smartphone</option>
              <option value='Laptop'>Laptop</option>
              <option value='Camera'>Camera</option>
              <option value='Accessories'>Accessories</option>
            </select>
          </div>
          <div className='flex flex-col gap-1 w-32'>
            <label className='text-base font-medium' htmlFor='product-price'>
              Product Price
            </label>
            <input
              id='product-price'
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40'
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className='flex flex-col gap-1 w-32'>
            <label className='text-base font-medium' htmlFor='offer-price'>
              Offer Price
            </label>
            <input
              id='offer-price'
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40'
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>

        {/* Color Swatch Section */}
        <div>
          <p className='text-base font-medium'>Available Colors</p>
          <div className='flex flex-wrap gap-2 mt-2'>
            {colorSwatch.map((color) => (
              <div
                key={color.name}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                  selectedColors.some((c) => c.name === color.name)
                    ? 'border-orange-500'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
              ></div>
            ))}
          </div>
        </div>

        <button
          type='submit'
          className='px-8 py-2.5 bg-orange-600 text-white font-medium rounded'
        >
          ADD
        </button>
      </form>
    </div>
  )
}

export default AddProduct
