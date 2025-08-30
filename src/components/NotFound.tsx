import { Link } from 'react-router-dom'

export default function NotFound({
    title = 'Not found',
    description = 'The item you’re looking for doesn’t exist or may have been removed.',
    ctaHref = '/',
    ctaLabel = 'Go Home',
}: {
    title?: string
    description?: string
    ctaHref?: string
    ctaLabel?: string
}) {
    return (
        <div className="max-w-xl mx-auto p-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">😕</span>
            </div>
            <h1 className="mt-4 text-xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
            <div className="mt-4">
                <Link
                    to={ctaHref}
                    className="inline-block px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
                >
                    {ctaLabel}
                </Link>
            </div>
        </div>
    )
}
