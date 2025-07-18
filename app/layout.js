export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <head>
        <title>Horaris Rodalies</title>
        <meta name="description" content="Consulta fàcilment els horaris de la línia R11 de Rodalies entre Barcelona, Girona, Flaçà i Bordils. Trens rodalies, mitja distància (MD) i AVE. Rodalies de Catalunya, API oficial de la Generalitat i API descoberta de Renfe." />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph / WhatsApp / Facebook */}
        <meta property="og:title" content="Horaris Rodalies R11" />
        <meta property="og:description" content="Consulta fàcilment els horaris de la línia R11 de Rodalies entre Barcelona, Girona, Flaçà i Bordils. Trens rodalies, mitja distància (MD) i AVE. Rodalies de Catalunya, API oficial de la Generalitat i API descoberta de Renfe." />
        <meta property="og:image" content="https://rodalies.lol/r11-foto.png" />
        <meta property="og:url" content="https://rodalies.lol" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Horaris Rodalies R11" />
        <meta name="twitter:description" content="Consulta fàcilment els horaris de la línia R11 de Rodalies entre Barcelona, Girona, Flaçà i Bordils. Trens rodalies, mitja distància (MD) i AVE. Rodalies de Catalunya, API oficial de la Generalitat i API descoberta de Renfe." />
        <meta name="twitter:image" content="https://rodalies.lol/r11-foto.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}