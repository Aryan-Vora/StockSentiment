"use client"

import { useRef, useEffect } from "react"
import "../components/particles.min.js"

export function NetworkAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Custom initialization for edge-concentrated particles
    const initParticles = () => {
      if (typeof window !== 'undefined' && (window as any).particlesJS) {
        // Create a custom shape with more particles at the edges
        (window as any).particlesJS('particles-js', {
          particles: {
            number: {
              value: 300,
              density: {
                enable: true,
                value_area: 1000
              }
            },
            color: {
              value: "#3b82f6"
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.6, 
              random: true, // Gives a depth effect
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.3,
                sync: false
              }
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.3,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 155, // this never feels right
              color: "#3b82f6",
              opacity: 0.25,
              width: 1.5
            },
            move: {
              enable: true,
              speed: 2,
              direction: "outside", // Push particles outward
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
    };

    initParticles();

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

