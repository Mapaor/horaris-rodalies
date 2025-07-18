export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <head>
        <title>Horaris Rodalies</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}