import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search, GraduationCap, Calendar, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold">
              找到你的专属私教
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              英语、法语、对外汉语、法律咨询...多领域专家1对1教学
            </p>
            
            {/* Search Box */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-2 bg-white/10 backdrop-blur rounded-lg p-2">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-md px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索教师、课程..."
                    className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  搜索
                </Button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/teachers">
                  浏览教师
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20" asChild>
                <Link href="/become-teacher">
                  成为教师
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            课程分类
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/teachers?subject=${category.name}`}
                className="card-hover bg-white rounded-lg p-6 text-center space-y-3 shadow-sm hover:shadow-md"
              >
                <div className="text-4xl">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} 位教师
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">热门教师</h2>
            <Link href="/teachers" className="text-primary hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-hover bg-white rounded-lg shadow-sm border p-6 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
                <div>
                  <h3 className="font-semibold">教师姓名</h3>
                  <p className="text-sm text-muted-foreground">英语教学</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">4.9</span>
                  <span className="text-muted-foreground text-sm">(128)</span>
                </div>
                <div className="text-lg font-bold text-primary">
                  ¥150<span className="text-sm font-normal">/课时</span>
                </div>
                <Button className="w-full" variant="outline">
                  查看详情
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Advantages */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            为什么选择 TalkyOne
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">严格审核</h3>
              <p className="text-muted-foreground">
                所有教师均通过资质认证和平台审核，确保教学质量
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">灵活约课</h3>
              <p className="text-muted-foreground">
                自由选择时间和教师，1对1定制化教学服务
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">安全保障</h3>
              <p className="text-muted-foreground">
                资金托管、课后评价、纠纷处理，全方位保障权益
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary text-white">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            准备好开始学习了吗？
          </h2>
          <p className="text-xl opacity-90">
            加入 TalkyOne，找到最适合你的专属私教
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                免费注册
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20" asChild>
              <Link href="/become-teacher">
                成为教师
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const categories = [
  { name: '英语', icon: '🇬🇧', count: 128 },
  { name: '法语', icon: '🇫🇷', count: 56 },
  { name: '对外汉语', icon: '🇨🇳', count: 89 },
  { name: '法律咨询', icon: '⚖️', count: 34 },
  { name: '日语', icon: '🇯🇵', count: 67 },
  { name: '韩语', icon: '🇰🇷', count: 45 },
  { name: '西班牙语', icon: '🇪🇸', count: 38 },
  { name: '德语', icon: '🇩🇪', count: 29 },
]
