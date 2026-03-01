"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"

interface RoutineStep {
  step: number
  label: string
  product: string
  brand: string
  image: string
  link: string
}

const morningRoutine: RoutineStep[] = [
  {
    step: 1,
    label: "洗顔",
    product: "グリーンティー フォームクレンザー",
    brand: "innisfree",
    image: "/images/product-cleanser.jpg",
    link: "#",
  },
  {
    step: 2,
    label: "化粧水",
    product: "グリーンティーシード ヒアルロン トナー",
    brand: "innisfree",
    image: "/images/product-toner.jpg",
    link: "#",
  },
  {
    step: 3,
    label: "美容液",
    product: "グリーンティーシード ヒアルロン セラム",
    brand: "innisfree",
    image: "/images/product-serum.jpg",
    link: "#",
  },
  {
    step: 4,
    label: "日焼け止め",
    product: "デイリー UV プロテクション SPF50+",
    brand: "innisfree",
    image: "/images/product-sunscreen.jpg",
    link: "#",
  },
]

export function RoutineSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
          {"AM"}
        </div>
        <h2 className="text-base font-bold text-foreground">
          {"朝のスキンケアルーティン"}
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {morningRoutine.map((item, index) => (
          <a
            key={item.step}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {item.step}
            </div>
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
              <Image
                src={item.image}
                alt={item.product}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                {item.brand}
              </span>
              <span className="truncate text-sm font-medium text-card-foreground">
                {item.product}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ))}
      </div>
    </section>
  )
}
