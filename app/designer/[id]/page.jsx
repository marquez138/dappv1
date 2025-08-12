'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import { assets } from '@/assets/assets'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Loading from '@/components/Loading'
import InlineSVG from '@/components/InlineSVG'
import { Rnd } from 'react-rnd'

const DesignerPage = () => {
  const { id } = useParams()
  const { products } = useAppContext()
  const [product, setProduct] = useState(null)
  const [activeView, setActiveView] = useState('front')
  const [designs, setDesigns] = useState({})
  const [currentColor, setCurrentColor] = useState(null)
  const [bounds, setBounds] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (products.length > 0) {
      const currentProduct = products.find((p) => p._id === id)
      setProduct(currentProduct)
      if (currentProduct && currentProduct.availableColors.length > 0) {
        setCurrentColor(currentProduct.availableColors[0].hex)
      }
    }
  }, [id, products])

  // Recalculate bounds when the active view changes or the component mounts
  useEffect(() => {
    const calculateBounds = () => {
      if (canvasRef.current) {
        const svgNode = canvasRef.current.querySelector('svg')
        const printAreaNode = canvasRef.current.querySelector('#print-area')

        if (svgNode && printAreaNode) {
          const svgViewBox = svgNode.viewBox.baseVal
          const canvasRect = canvasRef.current.getBoundingClientRect()

          const scaleX = canvasRect.width / svgViewBox.width
          const scaleY = canvasRect.height / svgViewBox.height

          setBounds({
            width: printAreaNode.width.baseVal.value * scaleX,
            height: printAreaNode.height.baseVal.value * scaleY,
            x: printAreaNode.x.baseVal.value * scaleX,
            y: printAreaNode.y.baseVal.value * scaleY,
          })
        }
      }
    }

    // Delay calculation to ensure SVG is rendered
    const timeoutId = setTimeout(calculateBounds, 100)

    window.addEventListener('resize', calculateBounds)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', calculateBounds)
    }
  }, [activeView, product])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && bounds) {
      setDesigns((prev) => ({
        ...prev,
        [activeView]: {
          image: URL.createObjectURL(file),
          width: bounds.width * 0.8, // Start smaller
          height: bounds.height * 0.8,
          x: bounds.x + bounds.width * 0.1, // Center it
          y: bounds.y + bounds.height * 0.1,
          rotation: 0,
        },
      }))
    }
  }

  const updateDesign = (view, data) => {
    setDesigns((prev) => ({
      ...prev,
      [view]: { ...prev[view], ...data },
    }))
  }

  if (!product) return <Loading />

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

        <section className='flex-1 flex flex-col items-center justify-center p-4'>
          <div
            ref={canvasRef}
            className='relative w-full max-w-lg h-auto aspect-square'
          >
            {templateSrc && (
              <div className='absolute inset-0'>
                <InlineSVG
                  src={templateSrc}
                  color={currentColor}
                  className='w-full h-full'
                />
              </div>
            )}
            {currentDesign && bounds && (
              <Rnd
                size={{
                  width: currentDesign.width,
                  height: currentDesign.height,
                }}
                position={{ x: currentDesign.x, y: currentDesign.y }}
                onDragStop={(e, d) =>
                  updateDesign(activeView, { x: d.x, y: d.y })
                }
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateDesign(activeView, {
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                    ...position,
                  })
                }}
                style={{
                  backgroundImage: `url(${currentDesign.image})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  transform: `rotate(${currentDesign.rotation}deg)`,
                }}
                bounds='parent'
                lockAspectRatio={true}
              />
            )}
          </div>
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

        <aside className='w-full md:w-64 bg-white p-4 border-t md:border-l'>
          <h2 className='font-semibold'>{product.name}</h2>
          <p className='text-sm text-gray-500'>Custom Design</p>
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
                />
              ))}
            </div>
          </div>
          {currentDesign && (
            <div className='mt-4'>
              <label className='text-sm font-medium'>Rotate</label>
              <div className='flex items-center gap-2 mt-1'>
                <input
                  type='range'
                  min='-180'
                  max='180'
                  value={currentDesign.rotation}
                  onChange={(e) =>
                    updateDesign(activeView, {
                      rotation: parseInt(e.target.value),
                    })
                  }
                  className='w-full'
                />
                <span>{currentDesign.rotation}°</span>
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
