export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer footer-center p-4 bg-neutral text-neutral-content text-sm">
      <p>Copyright © {year} Leetlab. All rights reserved.</p>
    </footer>
  );
}
