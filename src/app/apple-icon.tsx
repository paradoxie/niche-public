import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 80,
                    background: 'linear-gradient(to bottom right, #ffffff, rgba(255,255,255,0.6))',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0a0a',
                    fontWeight: 700,
                    borderRadius: 24, // Rounded corners for Apple consistency
                }}
            >
                NS
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported dimensions
            ...size,
        }
    );
}
