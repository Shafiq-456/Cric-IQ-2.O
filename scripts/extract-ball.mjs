import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function extractBall() {
  const zai = await ZAI.create();

  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/img2.png');
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  console.log('Sending image edit request...');

  const response = await zai.images.generations.edit({
    prompt: 'Isolate only the red cricket ball from this image. Remove the entire dark/black background completely, making it fully transparent. Keep only the cricket ball with its red leather texture, white stitching/seams, scratches, and the KOOKABURRA brand text. The ball should be centered in the square image. Maintain all realistic details of the ball.',
    images: [{ url: dataUrl }],
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/upload/cricket-ball-extracted.png', buffer);
  console.log(`Extracted ball saved. Size: ${buffer.length} bytes`);
}

extractBall().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});