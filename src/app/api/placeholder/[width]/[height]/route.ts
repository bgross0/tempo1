import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  const width = parseInt(params.width, 10);
  const height = parseInt(params.height, 10);

  // Validate dimensions
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width > 1200 || height > 1200) {
    return new NextResponse('Invalid dimensions', { status: 400 });
  }

  // Create SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="100%" height="100%" fill="#e5e7eb" opacity="0.5"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af">
        ${width} × ${height}
      </text>
    </svg>
  `;

  // Return SVG as an image
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
