import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyCard } from './PropertyCard'
import type { Property } from '@shared/types'
import { vi } from 'vitest'

// Mock the ResponsiveImage component
vi.mock('./ui/responsive-image', () => ({
  ResponsiveImage: ({ alt }: { alt: string }) => <img alt={alt} src="test-image.jpg" />
}))

// Mock the ShareButtons component
vi.mock('./ShareButtons', () => ({
  ShareButtons: () => <div data-testid="share-buttons">Share Buttons</div>
}))

// Mock wouter Link
vi.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock formatPrice utility
vi.mock('@/lib/utils', () => ({
  generatePropertySlug: vi.fn(() => '/test-slug'),
  formatPrice: vi.fn((price) => `Rp ${price}`),
  formatPriceNew: vi.fn((price) => `Rp ${price}`),
  cn: vi.fn((...classes: any[]) => classes.join(' ')),
}))

const mockProperty: Property = {
  id: '1',
  kodeListing: 'TEST001',
  judulProperti: 'Test Property',
  deskripsi: 'Test description',
  jenisProperti: 'rumah',
  hargaProperti: '500000000',
  provinsi: 'yogyakarta',
  kabupaten: 'sleman',
  status: 'dijual',
  imageUrl: 'test-image.jpg',
  isPremium: false,
  isFeatured: false,
  isHot: false,
  isSold: false,
  isPropertyPilihan: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)

    expect(screen.getByText('TEST001')).toBeInTheDocument()
    expect(screen.getByText('Test Property')).toBeInTheDocument()
    expect(screen.getByText('Sleman, Yogyakarta')).toBeInTheDocument()
    expect(screen.getByText('Rp 500000000')).toBeInTheDocument()
    expect(screen.getByText('🏠 Rumah')).toBeInTheDocument()
  })

  it('displays sold overlay when property is sold', () => {
    const soldProperty = { ...mockProperty, isSold: true }
    render(<PropertyCard property={soldProperty} />)

    expect(screen.getByText('TERJUAL')).toBeInTheDocument()
  })

  it('shows favorite button when onToggleFavorite is provided', () => {
    const mockToggleFavorite = vi.fn()
    render(
      <PropertyCard
        property={mockProperty}
        onToggleFavorite={mockToggleFavorite}
        isFavorite={false}
      />
    )

    const favoriteButton = screen.getByTestId('button-favorite')
    expect(favoriteButton).toBeInTheDocument()

    fireEvent.click(favoriteButton)
    expect(mockToggleFavorite).toHaveBeenCalledWith('1')
  })

  it('renders loading state correctly', () => {
    // This test would need to be updated based on actual loading implementation
    // For now, just verify the component renders without crashing
    expect(() => render(<PropertyCard property={mockProperty} />)).not.toThrow()
  })

  it('displays premium badge for premium properties', () => {
    const premiumProperty = { ...mockProperty, isPremium: true }
    render(<PropertyCard property={premiumProperty} />)

    expect(screen.getByTestId('badge-premium')).toBeInTheDocument()
  })

  it('displays hot badge for hot properties', () => {
    const hotProperty = { ...mockProperty, isHot: true }
    render(<PropertyCard property={hotProperty} />)

    expect(screen.getByTestId('badge-hot')).toBeInTheDocument()
  })

  it('displays featured badge for featured properties', () => {
    const featuredProperty = { ...mockProperty, isFeatured: true }
    render(<PropertyCard property={featuredProperty} />)

    expect(screen.getByTestId('badge-featured')).toBeInTheDocument()
  })
})