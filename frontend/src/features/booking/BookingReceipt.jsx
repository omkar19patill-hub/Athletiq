import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircle2, Download, Calendar, Clock, MapPin, Trophy, Printer, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const BookingReceipt = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef();

  useEffect(() => {
    bookingService.getById(id)
      .then((res) => {
        if (res.success) setBooking(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SportSphere_Receipt_${booking?.bookingNumber}.pdf`);
    });
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-emerald-950">Booking Confirmed!</h1>
              <p className="text-xs text-emerald-700 mt-0.5">Your turf slot is reserved. Booking Ref: <strong className="font-mono">{booking.bookingNumber}</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF Receipt
            </button>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div ref={receiptRef} className="bg-white rounded-card p-8 shadow-soft border border-slate-100 space-y-8 text-slate-800">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900">Sport<span className="text-primary-600">Sphere</span></span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Booking Pass</span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                {booking.paymentStatus}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-mono">Issued: {new Date(booking.bookedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Booking Summary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Venue & Location</span>
              <h3 className="text-base font-extrabold text-slate-900">{booking.venueName}</h3>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" /> {booking.venueCity}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reserved Court</span>
              <h3 className="text-base font-extrabold text-slate-900">{booking.courtName}</h3>
              <p className="text-xs text-slate-600 mt-1 font-semibold">Ref No: {booking.bookingNumber}</p>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-3 gap-4 text-center border-y border-slate-100 py-6">
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Booking Date</span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4 text-primary-600" /> {booking.bookingDate}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">Start Time</span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-primary-600" /> {booking.startTime?.substring(0, 5)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-1">End Time</span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-primary-600" /> {booking.endTime?.substring(0, 5)}
              </span>
            </div>
          </div>

          {/* Payment & Customer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booker Details</h4>
            <div className="flex justify-between text-xs text-slate-700">
              <span>Customer Name:</span>
              <strong className="text-slate-900">{booking.customerName}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700">
              <span>Email Address:</span>
              <strong className="text-slate-900">{booking.customerEmail}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700 pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Total Amount Paid:</span>
              <strong className="text-lg font-extrabold text-primary-600">₹{booking.totalAmount}</strong>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center">
            Present this booking receipt or show your booking number at the venue reception 15 minutes prior to slot start time.
          </div>
        </div>

        <div className="text-center">
          <Link to="/customer/bookings" className="text-xs font-bold text-primary-600 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Go to My Bookings History
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
};
