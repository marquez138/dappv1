'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import { assets } from '@/assets/assets'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import Image from 'next/image'
import InlineSVG from '@/components/InlineSVG' // Import the new component

const DesignerPage = () => {
  const { id } = useParams()
  const { products } = useAppContext()
  const [product, setProduct] = useState(null)
  const [activeView, setActiveView] = useState('front')
  const [designs, setDesigns] = useState({})
  const [currentColor, setCurrentColor] = useState(null)

  useEffect(() => {
    if (products.length > 0) {
      const currentProduct = products.find((p) => p._id === id)
      setProduct(currentProduct)
      if (currentProduct && currentProduct.availableColors.length > 0) {
        setCurrentColor(currentProduct.availableColors[0].hex)
      }
    }
  }, [id, products])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const newDesigns = {
        ...designs,
        [activeView]: {
          image: URL.createObjectURL(file),
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        },
      }
      setDesigns(newDesigns)
    }
  }

  const updateDesign = (property, value) => {
    if (designs[activeView]) {
      const newDesigns = { ...designs }
      newDesigns[activeView][property] += value
      setDesigns(newDesigns)
    }
  }

  if (!product) {
    return <Loading />
  }

  const availableViews = Object.keys(product.designTemplates || {}).filter(
    (key) => product.designTemplates[key]
  )
  const currentDesign = designs[activeView]
  const templateSrc = product.designTemplates[activeView]
    ? assets.designTemplates[product.designTemplates[activeView]].src
    : ''

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
            {templateSrc ? (
              <>
                <InlineSVG
                  src={templateSrc}
                  color={currentColor}
                  className='w-full h-full'
                />
                {currentDesign && (
                  <div
                    className='absolute top-1/2 left-1/2 w-1/2 h-1/2 flex items-center justify-center'
                    style={{
                      transform: `translate(-50%, -50%) translate(${currentDesign.x}px, ${currentDesign.y}px) scale(${currentDesign.scale}) rotate(${currentDesign.rotation}deg)`,
                    }}
                  >
                    <img
                      src={currentDesign.image}
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

        {/* Right Panel */}
        <aside className='w-full md:w-64 bg-white p-4 border-t md:border-l'>
          <h2 className='font-semibold'>{product.name}</h2>
          <p className='text-sm text-gray-500'>Custom Design</p>

          {/* Color Swatches */}
          <div className='mt-4'>
            <h3 className='text-sm font-medium'>
              Color:{' '}
              {
                product.availableColors.find((c) => c.hex === currentColor)
                  ?.name
              }
            </h3>
            <div className='flex flex-wrap gap-2 mt-2'>
              {product.availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setCurrentColor(color.hex)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    currentColor === color.hex
                      ? 'border-orange-500'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {currentDesign && (
            <div className='mt-4 space-y-4'>
              <div>
                <label className='text-sm font-medium'>Move</label>
                <div className='grid grid-cols-2 gap-2 mt-1'>
                  <button
                    onClick={() => updateDesign('y', -5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    Up
                  </button>
                  <button
                    onClick={() => updateDesign('y', 5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    Down
                  </button>
                  <button
                    onClick={() => updateDesign('x', -5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    Left
                  </button>
                  <button
                    onClick={() => updateDesign('x', 5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    Right
                  </button>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium'>Scale</label>
                <div className='grid grid-cols-2 gap-2 mt-1'>
                  <button
                    onClick={() => updateDesign('scale', 0.1)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateDesign('scale', -0.1)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    -
                  </button>
                </div>
              </div>
              <div>
                <label className='text-sm font-medium'>Rotate</label>
                <div className='grid grid-cols-2 gap-2 mt-1'>
                  <button
                    onClick={() => updateDesign('rotation', 5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    ⟳
                  </button>
                  <button
                    onClick={() => updateDesign('rotation', -5)}
                    className='p-2 bg-gray-200 rounded'
                  >
                    ⟲
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
      <Footer />
    </div>
  )
}

export default DesignerPage
