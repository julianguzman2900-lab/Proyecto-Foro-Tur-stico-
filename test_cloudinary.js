const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'rxjxlozd',
  api_key: '645683928888955',
  api_secret: 'bNWRzproKO99o6gp75-Aw1VOKdY'
});

async function run() {
  try {
    const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    console.log('Uploading sample image to Cloudinary...');

    // 2. Upload an image
    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
      folder: 'onboarding'
    });

    console.log('Upload successful!');
    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);

    // 3. Get image details
    const resourceDetails = await cloudinary.api.resource(uploadResult.public_id);
    console.log('\nImage Details:');
    console.log(`Width: ${resourceDetails.width}px`);
    console.log(`Height: ${resourceDetails.height}px`);
    console.log(`Format: ${resourceDetails.format}`);
    console.log(`File Size: ${resourceDetails.bytes} bytes`);

    // 4. Transform the image
    // f_auto: Automatically selects the best image format depending on the browser (e.g. WebP or AVIF).
    // q_auto: Automatically optimizes the quality of the image to reduce file size without visible loss.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      secure: true
    });

    console.log('\nDone! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(transformedUrl);

  } catch (error) {
    console.error('Error during Cloudinary onboarding flow:', error);
    process.exit(1);
  }
}

run();
