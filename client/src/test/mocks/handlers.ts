import { http, HttpResponse } from 'msw'

// Mock data generators (simplified for now)
const generateMockProperty = (id: string = '1', overrides: any = {}) => ({
  id,
  kodeListing: `TEST${id}`,
  judulProperti: `Test Property ${id}`,
  deskripsi: 'Test property description',
  jenisProperti: 'rumah',
  hargaProperti: '500000000',
  provinsi: 'yogyakarta',
  kabupaten: 'sleman',
  status: 'dijual',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const generateMockUser = () => ({
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
})

const generateMockProperties = (count: number = 10) => {
  return Array.from({ length: count }, (_, i) =>
    generateMockProperty((i + 1).toString())
  )
}

export const handlers = [
  // Properties API
  http.get('/api/properties', () => {
    const properties = generateMockProperties(10)

    return HttpResponse.json({
      success: true,
      data: properties,
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      },
    })
  }),

  http.get('/api/properties/:id', ({ params }) => {
    const { id } = params
    const property = generateMockProperty(id as string)

    return HttpResponse.json({
      success: true,
      data: property,
    })
  }),

  http.post('/api/properties', async ({ request }) => {
    const body = await request.json() as any
    const newProperty = generateMockProperty('new-id', body)

    return HttpResponse.json({
      success: true,
      data: newProperty,
      message: 'Property created successfully',
    }, { status: 201 })
  }),

  http.put('/api/properties/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as any
    const updatedProperty = generateMockProperty(id as string, body)

    return HttpResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully',
    })
  }),

  http.delete('/api/properties/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Property deleted successfully',
    })
  }),

  // Authentication API
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any

    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: generateMockUser(),
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
      })
    }

    return HttpResponse.json({
      success: false,
      message: 'Invalid credentials',
    }, { status: 401 })
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
      },
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }),

  // File upload API
  http.post('/api/upload/images', () => {
    return HttpResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      images: [
        {
          originalName: 'test-image.jpg',
          webpPath: 'uploads/test-image.webp',
          webpUrl: '/uploads/test-image.webp',
          filename: 'test-image.webp',
          size: 1024000,
        },
      ],
    })
  }),

  // Error scenarios
  http.get('/api/properties/error', () => {
    return HttpResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 })
  }),

  http.get('/api/properties/not-found', () => {
    return HttpResponse.json({
      success: false,
      message: 'Property not found',
    }, { status: 404 })
  }),

  http.post('/api/properties/validation-error', () => {
    return HttpResponse.json({
      success: false,
      message: 'Validation failed',
      errors: {
        judulProperti: ['Title is required'],
        hargaProperti: ['Price must be a positive number'],
      },
    }, { status: 400 })
  }),
]