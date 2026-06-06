'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/training/dashboard', icon: '📊' },
  { name: 'All Courses', href: '/training/courses', icon: '📚' },
  { name: 'My Learning', href: '/training/my-learning', icon: '🎯' },
  { name: 'Certifications', href: '/training/certifications', icon: '📜' },
  { name: 'Messages', href: '/training/messages', icon: '💬' },
  { name: 'Settings', href: '/training/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Reliant <span className="text-foreground">LMS</span>
        </Link>
      </div>
      
      <nav className="flex-grow px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-primary-light text-primary'
                : 'text-foreground/60 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
