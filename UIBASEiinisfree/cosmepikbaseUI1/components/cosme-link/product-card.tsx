"use client"

import Image from "next/image"
import { Heart, ExternalLink, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export interface Product {
  id: string
  name: string
  brand: string
  price: string
  image: string
  rating: number
  reviewCount: number
  category: string
  badge?: "NEW" | "BEST" | "SALE"
  link: string
}

interface ProductCardProps {
  product: Product
  variant?: "grid" | "featured"
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3 w-3",
              star <= rating
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  )
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const [liked, setLiked] = useState(false)

  if (variant === "featured") {
    return (
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              {product.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              setLiked(!liked)
            }}
            aria-label={liked ? "お気に入りから削除" : "お気に入りに追加"}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                liked ? "fill-destructive text-destructive" : "text-foreground"
              )}
            />
          </button>
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {product.brand}
          </p>
          <h3 className="text-base font-semibold leading-tight text-card-foreground text-pretty">
            {product.name}
          </h3>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-base font-bold text-card-foreground">
              {product.price}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              {"購入する"}
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            setLiked(!liked)
          }}
          aria-label={liked ? "お気に入りから削除" : "お気に入りに追加"}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors hover:bg-card"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              liked ? "fill-destructive text-destructive" : "text-foreground"
            )}
          />
        </button>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
          {product.name}
        </h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-sm font-bold text-card-foreground">
            {product.price}
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
    </a>
  )
}
