'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import { assets } from '@/assets/assets'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import Image from 'next/image'

const DesignerPage = () => {
  const { id } = useParams()
  const { products } = useAppContext()
  const [product, setProduct] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [activeView, setActiveView] = useState('front')

  useEffect(() => {
    if (products.length > 0) {
      const currentProduct = products.find((p) => p._id === id)
      setProduct(currentProduct)
    }
  }, [id, products])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedImage(URL.createObjectURL(file))
    }
  }

  if (!product) {
    return <Loading />
  }

  const availableViews = Object.keys(product.designTemplates || {}).filter(
    (key) => product.designTemplates[key]
  )

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-grow flex flex-col md:flex-row bg-gray-100'>
        {/* Left Toolbar */}
        <aside className='w-full md:w-20 bg-white p-4 flex md:flex-col items-center gap-4 border-b md:border-r'>
          <label
            htmlFor='upload-input'
            className='cursor-pointer flex flex-col items-center text-gray-600 hover:text-orange-600'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            <span className='text-xs'>Upload</span>
          </label>
          <input
            id='upload-input'
            type='file'
            onChange={handleImageUpload}
            className='hidden'
          />
        </aside>

        {/* Main Designer Canvas */}
        <section className='flex-1 flex flex-col items-center justify-center p-4'>
          <div className='relative w-full max-w-lg h-auto aspect-square flex items-center justify-center'>
            {product.designTemplates && product.designTemplates[activeView] ? (
              <>
                <Image
                  src={
                    assets.designTemplates[product.designTemplates[activeView]]
                  }
                  alt={`${activeView} view`}
                  className='max-w-full max-h-full'
                />
                {uploadedImage && (
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 flex items-center justify-center'>
                    <img
                      src={uploadedImage}
                      alt='Uploaded Design'
                      className='max-w-full max-h-full object-contain'
                    />
                  </div>
                )}
              </>
            ) : (
              <p>Design template not available for this view.</p>
            )}
          </div>
          {/* View Selection */}
          <div className='mt-4 flex items-center justify-center gap-2 p-1 bg-gray-200 rounded-full'>
            {availableViews.map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  activeView === view
                    ? 'bg-white text-gray-800 shadow'
                    : 'bg-transparent text-gray-500 hover:bg-gray-300'
                }`}
              >
                {view
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </button>
            ))}
          </div>
        </section>

        {/* Right Panel (for future use) */}
        <aside className='w-full md:w-64 bg-white p-4 border-t md:border-l'>
          <h2 className='font-semibold'>{product.name}</h2>
          <p className='text-sm text-gray-500'>Custom Design</p>
          {/* Add color swatches, etc. here later */}
        </aside>
      </main>
      <Footer />
    </div>
  )
}

export default DesignerPage
