/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default nextConfig;

// next.config.js
// const nextConfig = {
//     webpack: (config) => {
//         config.module.rules.push({
//             test: /\.(mp3|wav)$/, // Add other audio formats if needed
//             type: 'asset/resource', // This handles the audio file as a separate asset
//         });
//         return config;
//     },
//     async redirects() {
//         return [
//           {
//             source: '/',
//             destination: '/login',
//             permanent: true, // Set to true if this is a permanent redirect (HTTP 308)
//           },
//         ];
//     },

// };

// module.exports = nextConfig;

// const nextConfig = {
//   async redirects() {
//     return [
//       {
//         source: "/",
//         destination: "/",
//         permanent: true,
//       },
//     ];
//   },
// };

// export default nextConfig;