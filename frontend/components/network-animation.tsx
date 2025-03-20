"use client"

import { useRef, useEffect } from "react"
import "../components/particles.min.js"

export function NetworkAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).particlesJS) {
      (window as any).particlesJS('particles-js', {
        particles: {
          number: {
            value: 300,
          },
          color: {
            value: "#000000" 
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.8, 
            random: false,
          },
          size: {
            value: 1, 
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#000000",
            opacity: 0.15, 
            width: 1.75
          },
          move: {
            enable: true,
            speed: 2.5, 
            direction: "none",
            random: true, 
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: false,
            },
            onclick: {
              enable: false,
            },
            resize: true
          }
        },
        retina_detect: true,
        background: {
          color: "transparent",
          opacity: 0
        }
      });
    }

    return () => {
      const canvas = document.querySelector('#particles-js > canvas')
      if (canvas) {
        canvas.remove()
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 -z-10 mt-14" style={{ pointerEvents: "none" }}>
      <div id="particles-js" ref={containerRef} className="w-full h-full"></div>
    </div>
  )
}

