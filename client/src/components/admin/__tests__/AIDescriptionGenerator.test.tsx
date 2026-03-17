import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AIDescriptionGenerator } from '../AIDescriptionGenerator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

const mockPropertyData = {
  jenis_properti: 'kost',
  provinsi: 'Daerah Istimewa Yogyakarta',
  kabupaten: 'Sleman',
  harga_properti: '800000', // Should be string
  judul_properti: 'Kost Modern Dekat UGM'
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('AIDescriptionGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with property data', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <AIDescriptionGenerator
          propertyData={mockPropertyData}
          onDescriptionChange={() => {}}
        />
      </Wrapper>
    )

    expect(screen.getByText('AI Description Generator')).toBeInTheDocument()
    expect(screen.getByText('kost')).toBeInTheDocument()
  })

  it('shows loading state during generation', async () => {
    const mockResponse = {
      ai_title: 'Updated Title',
      ai_description: 'Generated description',
      is_generated: true
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <AIDescriptionGenerator
          propertyData={mockPropertyData}
          onDescriptionChange={() => {}}
        />
      </Wrapper>
    )

    const generateButton = screen.getByText('Generate AI Description')
    fireEvent.click(generateButton)

    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const Wrapper = createWrapper()
    const mockOnDescriptionChange = vi.fn()

    render(
      <Wrapper>
        <AIDescriptionGenerator
          propertyData={mockPropertyData}
          onDescriptionChange={mockOnDescriptionChange}
        />
      </Wrapper>
    )

    const generateButton = screen.getByText('Generate AI Description')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/gagal generate/i)).toBeInTheDocument()
    })
  })

  it('validates required fields before generation', () => {
    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <AIDescriptionGenerator
          propertyData={{}} // Empty data
          onDescriptionChange={() => {}}
        />
      </Wrapper>
    )

    const generateButton = screen.getByText('Generate AI Description')
    fireEvent.click(generateButton)

    expect(screen.getByText('Data tidak lengkap')).toBeInTheDocument()
  })

  it('updates description when AI generation succeeds', async () => {
    const mockResponse = {
      ai_title: 'AI Generated Title',
      ai_description: 'AI generated description with clickbait elements',
      is_generated: true
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const mockOnDescriptionChange = vi.fn()
    const Wrapper = createWrapper()

    render(
      <Wrapper>
        <AIDescriptionGenerator
          propertyData={mockPropertyData}
          onDescriptionChange={mockOnDescriptionChange}
        />
      </Wrapper>
    )

    const generateButton = screen.getByText('Generate AI Description')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockOnDescriptionChange).toHaveBeenCalledWith('AI generated description with clickbait elements')
    })

    expect(screen.getByText('Deskripsi AI berhasil dibuat!')).toBeInTheDocument()
  })
})