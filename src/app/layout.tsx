import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Pro - Quản lý khách hàng",
  description: "Hệ thống CRM chuyên nghiệp - Quản lý liên hệ, công ty, deals và hoạt động kinh doanh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
