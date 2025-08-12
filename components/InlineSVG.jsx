'use client'
import { useEffect, useState } from 'react'

const InlineSVG = ({ src, color, className }) => {
  const [svgContent, setSvgContent] = useState('')

  useEffect(() => {
    if (src) {
      fetch(src)
        .then((res) => res.text())
        .then(setSvgContent)
        .catch(console.error)
    }
  }, [src])

  return (
    <div
      className={className}
      style={{ color: color }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

export default InlineSVG
