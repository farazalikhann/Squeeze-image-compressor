import type { FaqItem } from '../components/FaqSection'

export interface SeoContent {
  title: string
  description: string
  h1: string
  intro: string
  faqs: FaqItem[]
}

/** SEO copy per route, keyed by tool id (matching `src/lib/tools.ts`) plus `home`.
 *  Titles/descriptions target real search intent ("compress image online",
 *  "resize image free", "convert jpg to png", "image to pdf", "remove exif data",
 *  etc.) without stuffing — each was written to read naturally first. */
export const SEO_CONTENT: Record<string, SeoContent> = {
  home: {
    title: 'Squeeze — Free Online Image Tools (100% Private, No Upload)',
    description:
      'Compress, resize, convert, crop, and edit images online for free. Squeeze runs entirely in your browser — no uploads, no accounts, no tracking.',
    h1: 'Every image tool you need.',
    intro:
      "Squeeze is a free collection of image tools that run entirely in your browser — compress, resize, convert, crop, rotate, watermark, strip metadata, or turn images into a PDF, all without ever uploading a file to a server. Pick a tool below, drop in your images, and download the result. Nothing you process here ever leaves your device.",
    faqs: [],
  },
  compress: {
    title: 'Compress Images Online Free - No Upload | Squeeze',
    description:
      'Compress JPG, PNG, WebP, and AVIF images online for free. Smart, custom, or lossless compression with instant results — no uploads, 100% private in your browser.',
    h1: 'Compress Images Online for Free',
    intro:
      'Shrink your image file sizes without losing the quality that matters. Choose Smart compression for a balanced result, Maximum for the smallest possible file, or dial in an exact target size in kilobytes — all processed instantly in your browser, with nothing ever uploaded to a server.',
    faqs: [
      {
        question: 'Is this image compressor really free?',
        answer:
          'Yes. Squeeze is completely free to use, with no account, no watermarks, and no limit on how many times you can compress images.',
      },
      {
        question: 'Do you upload my images to a server?',
        answer:
          "No. Every image is compressed locally using your browser's own processing power. Your files never leave your device, which is also why there's no upload wait.",
      },
      {
        question: "What's the difference between Smart and Maximum compression?",
        answer:
          'Smart compression balances file size and visual quality automatically. Maximum compression prioritizes the smallest possible file size, which can introduce more visible quality loss on detailed photos.',
      },
    ],
  },
  resize: {
    title: 'Resize Images Online Free | Squeeze',
    description:
      'Resize images to exact pixel dimensions or common presets like 1920×1080 and 1080×1080, right in your browser. Free, private, no upload required.',
    h1: 'Resize Images Online for Free',
    intro:
      'Resize any image to an exact width and height, or pick a common preset like 1920×1080 or 1080×1080. Lock the aspect ratio to avoid stretching, preview the result before you download, and everything happens on your own device — no upload, no waiting.',
    faqs: [
      {
        question: 'Will resizing reduce my image quality?',
        answer:
          "Making an image smaller generally preserves quality well. Making it significantly larger than its original size can introduce some softness, since new pixels have to be interpolated — that's true of any resizing tool, not just Squeeze.",
      },
      {
        question: 'Can I resize without distorting the image?',
        answer:
          'Yes — turn on "Lock aspect ratio" and the height will automatically adjust whenever you change the width (and vice versa), so your image never looks stretched or squashed.',
      },
      {
        question: 'What image formats can I resize?',
        answer: 'Squeeze supports JPG, PNG, WebP, and AVIF for both the original file and the resized output.',
      },
    ],
  },
  convert: {
    title: 'Convert JPG to PNG, WebP & More Online Free | Squeeze',
    description:
      'Convert JPG to PNG, PNG to WebP, and more — free online image format converter. Batch convert multiple images at once, entirely in your browser.',
    h1: 'Convert Images Online — JPG, PNG, WebP & AVIF',
    intro:
      'Convert images between JPG, PNG, WebP, and AVIF in a couple of clicks. Pick your target format once and apply it to a single photo or a batch of up to 100 — the conversion happens locally, so your files are never sent anywhere.',
    faqs: [
      {
        question: 'Can I convert JPG to PNG for free?',
        answer: 'Yes, and the reverse too — JPG to PNG, PNG to WebP, WebP to AVIF, or any combination, at no cost.',
      },
      {
        question: 'Can I convert multiple images at once?',
        answer:
          'Yes. Upload a batch of images, pick one target format, and Squeeze converts all of them, then lets you download everything together as a ZIP.',
      },
      {
        question: 'Does converting reduce image quality?',
        answer:
          'Converting to a lossy format like JPG or WebP re-encodes the image at a high quality setting, so any loss is minimal. Converting to PNG is lossless.',
      },
    ],
  },
  crop: {
    title: 'Crop Images Online Free | Squeeze',
    description:
      'Crop images online free with an interactive drag-and-resize crop box. Choose from aspect ratio presets like 1:1, 4:3, and 16:9 — no uploads, works on mobile.',
    h1: 'Crop Images Online for Free',
    intro:
      'Drag and resize an interactive crop box to select exactly the part of the image you want to keep. Snap to common aspect ratios like 1:1, 4:3, 16:9, or 3:2, or crop freely — it works smoothly with touch on mobile as well as a mouse.',
    faqs: [
      {
        question: 'Does this crop tool work on my phone?',
        answer:
          'Yes — the crop box is fully touch-friendly, so you can drag and resize it with your finger just as easily as with a mouse.',
      },
      {
        question: 'What aspect ratios can I crop to?',
        answer: 'Free-form (matching the image\'s natural proportions), 1:1, 4:3, 16:9, and 3:2.',
      },
      {
        question: 'Is my image uploaded anywhere?',
        answer: 'No — the crop is rendered and exported entirely in your browser using the Canvas API.',
      },
    ],
  },
  rotate: {
    title: 'Rotate & Flip Images Online Free | Squeeze',
    description:
      'Rotate images 90°, 180°, or flip horizontally and vertically — free online, right in your browser. See a live preview before you download.',
    h1: 'Rotate & Flip Images Online',
    intro:
      'Rotate an image 90° left or right, flip it 180°, or mirror it horizontally and vertically. A live preview shows the change instantly, and the actual rotated file is only generated once you apply it — free, and processed entirely on your device.',
    faqs: [
      {
        question: 'Can I rotate by an angle other than 90°?',
        answer:
          'Squeeze supports 90° steps and 180° rotation, which covers the vast majority of "my photo is sideways/upside down" cases. Free-angle rotation isn\'t available yet.',
      },
      {
        question: 'Does rotating change my file format?',
        answer:
          "No, by default Squeeze keeps your original format. You can optionally choose a different output format (JPG, PNG, WebP, or AVIF) if you'd like.",
      },
      {
        question: 'Is this rotate tool free to use?',
        answer: 'Yes, completely free, with no limit on how many images you rotate or flip.',
      },
    ],
  },
  watermark: {
    title: 'Add Watermark to Images Online Free | Squeeze',
    description:
      'Add a text or logo watermark to your photos online for free. Batch watermark multiple images at once with adjustable position and opacity.',
    h1: 'Add a Watermark to Your Images',
    intro:
      'Stamp a text or logo watermark onto your photos to protect your work before sharing it online. Choose the position from a 9-point grid, adjust the opacity, and apply the same watermark to a whole batch of images at once — free, and processed locally in your browser.',
    faqs: [
      {
        question: 'Can I use my own logo as a watermark?',
        answer:
          'Yes — switch to "Logo / Image" mode and upload any image to use as your watermark, which will then be applied to every photo in your batch.',
      },
      {
        question: 'Can I watermark multiple images at once?',
        answer:
          'Yes. Upload as many images as you need (up to 100), set your watermark once, and apply it to the whole batch in one go.',
      },
      {
        question: 'Will the watermark position stay consistent across images?',
        answer:
          "Yes — the position, size, and opacity you choose are applied identically to every image, so your watermark looks consistent across a batch.",
      },
    ],
  },
  'metadata-remover': {
    title: 'Remove EXIF Data From Photos Online Free | Squeeze',
    description:
      'Remove EXIF, GPS location, and camera metadata from your photos before sharing them. See exactly what\'s hidden in your images, then strip it — free and private.',
    h1: 'Remove EXIF & GPS Data From Photos',
    intro:
      "Photos often carry hidden metadata — your camera model, the exact time a photo was taken, and sometimes the precise GPS coordinates of where it was shot. Squeeze scans each image and shows you exactly what it finds before removing anything, then re-checks the result so you can confirm it's actually clean.",
    faqs: [
      {
        question: 'What is EXIF data and why should I remove it?',
        answer:
          "EXIF is metadata embedded in photo files by cameras and phones — it can include the camera model, timestamp, and GPS location. Removing it before sharing a photo online protects your privacy, especially your location.",
      },
      {
        question: 'Can this tool tell me if my photo has GPS location data?',
        answer:
          'Yes — if GPS coordinates are found, Squeeze displays them clearly (highlighted as sensitive) before you remove anything, so you know exactly what was in the file.',
      },
      {
        question: 'How do I know the metadata was actually removed?',
        answer:
          'After cleaning, Squeeze re-scans the resulting file and shows a "Verified clean" confirmation only if no metadata is actually found in the output — it doesn\'t just assume the removal worked.',
      },
    ],
  },
  'image-to-pdf': {
    title: 'Convert Images to PDF Online Free | Squeeze',
    description:
      'Combine JPG, PNG, or WebP images into a single PDF online, free. Reorder pages, choose A4 or Letter size, and download — no uploads required.',
    h1: 'Convert Images to PDF Online',
    intro:
      "Combine one or more images into a single downloadable PDF. Drag to reorder pages, choose A4, Letter, or a page size that fits each image exactly, and set your margins — the PDF is built entirely in your browser, free, with no file ever uploaded.",
    faqs: [
      {
        question: 'Can I combine multiple images into one PDF?',
        answer: 'Yes — upload as many images as you like and Squeeze combines them into a single multi-page PDF.',
      },
      {
        question: 'Can I reorder the pages before creating the PDF?',
        answer:
          'Yes — drag any image to a new position in the list (this works with touch on mobile too) before you generate the PDF; the final page order matches exactly what you see in the list.',
      },
      {
        question: 'Is there a limit to how many images I can add?',
        answer: 'You can combine up to 100 images into a single PDF.',
      },
    ],
  },
}
