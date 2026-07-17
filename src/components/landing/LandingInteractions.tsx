"use client"

import { useEffect } from "react"

export function LandingInteractions() {
  useEffect(() => {
    let ticking = false
    let observer: IntersectionObserver | null = null
    let revealTimer: number | undefined
    let firstFrame = 0
    let secondFrame = 0

    function updateNav() {
      const nav = document.getElementById("main-nav")
      if (nav) {
        if (window.scrollY > 24) nav.classList.add("scrolled")
        else nav.classList.remove("scrolled")
      }
      ticking = false
    }

    function revealAll() {
      document.querySelectorAll<HTMLElement>(".sr:not(.visible)").forEach((el) => {
        el.classList.add("visible")
      })
    }

    function revealHero() {
      document.querySelectorAll<HTMLElement>(".hero-anim:not(.visible)").forEach((el) => {
        el.classList.add("visible")
      })
    }

    function initReveal() {
      const els = Array.from(document.querySelectorAll<HTMLElement>(".sr"))
      if (!els.length) return

      if (!("IntersectionObserver" in window)) {
        revealAll()
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible")
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      )

      els.forEach((el) => observer?.observe(el))
      revealTimer = window.setTimeout(revealAll, 600)
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateNav)
        ticking = true
      }
    }

    function handlePageShow() {
      updateNav()
      revealHero()
      revealAll()
    }

    document.body.classList.add("landing-enhanced")
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("pageshow", handlePageShow)
    updateNav()
    const heroTimer = window.setTimeout(revealHero, 1000)

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(initReveal)
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("pageshow", handlePageShow)
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      if (revealTimer) window.clearTimeout(revealTimer)
      window.clearTimeout(heroTimer)
      observer?.disconnect()
      document.body.classList.remove("landing-enhanced")
    }
  }, [])

  return null
}
