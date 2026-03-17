export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">
            Salam Bumi Property
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Agen properti terpercaya di Yogyakarta dengan pengalaman lebih dari 10 tahun dalam melayani kebutuhan properti Anda.
          </p>

          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-slate-400">Telepon</p>
              <p className="font-semibold">+62 812-3456-7890</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-semibold">info@salambumiproperty.com</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Alamat</p>
              <p className="font-semibold">Jl. Malioboro, Yogyakarta</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <p className="text-slate-400 text-sm">
              © 2024 Salam Bumi Property. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}