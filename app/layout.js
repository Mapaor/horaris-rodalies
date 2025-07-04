export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <head>
        <title>Horaris Rodalies</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}