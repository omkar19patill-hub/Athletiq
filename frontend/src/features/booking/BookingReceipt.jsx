import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { 
  CheckCircle2, Download, Calendar, Clock, MapPin, Trophy, 
  ArrowLeft, Copy, QrCode 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const BookingReceipt = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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
    html2canvas(input, { scale: 2, backgroundColor: '#0B0F17' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Athletiq_Booking_${booking?.bookingNumber}.pdf`);
    });
  };

  const handleCopyInvite = () => {
    const inviteText = `Athletiq Booking Confirmed!
Venue: ${booking?.venueName} (${booking?.courtName})
Date: ${booking?.bookingDate}
Time: ${booking?.startTime?.substring(0, 5)} - ${booking?.endTime?.substring(0, 5)}
Booking Ref: ${booking?.bookingNumber}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        {/* Booking Status Banner */}
        <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg ${
          booking.bookingStatus === 'CONFIRMED'
            ? 'bg-slate-900 border-slate-800'
            : booking.bookingStatus === 'PENDING'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              booking.bookingStatus === 'CONFIRMED'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : booking.bookingStatus === 'PENDING'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {booking.bookingStatus === 'CONFIRMED' ? (
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              ) : booking.bookingStatus === 'PENDING' ? (
                <Clock className="w-7 h-7 stroke-[2.2]" />
              ) : (
                <CheckCircle2 className="w-7 h-7 stroke-[2.2] rotate-45" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold font-display text-white">
                  {booking.bookingStatus === 'CONFIRMED'
                    ? 'Booking Confirmed!'
                    : booking.bookingStatus === 'PENDING'
                    ? 'Awaiting Turf Creator Acceptance'
                    : 'Booking Declined / Cancelled'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  booking.bookingStatus === 'CONFIRMED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : booking.bookingStatus === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {booking.bookingStatus === 'PENDING' ? '⏳ PENDING OWNER APPROVAL' : booking.bookingStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {booking.bookingStatus === 'PENDING' ? (
                  <span>Your slot is on hold. The turf creator/manager has been notified and will approve shortly.</span>
                ) : (
                  <span>Booking Reference: <strong className="text-white font-mono">{booking.bookingNumber}</strong></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleCopyInvite}
              className="btn-secondary py-2 px-3.5 text-xs font-medium rounded-lg"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share Details'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Clean Modern Pass Card */}
        <div ref={receiptRef} className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-white">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trophy className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-lg font-bold font-display tracking-tight">
                  ATHLET<span className="text-emerald-400">IQ</span>
                </span>
                <span className="block text-[11px] text-slate-400">
                  Official Booking Receipt
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-md">
                {booking.paymentStatus === 'PAID' ? 'Payment Verified' : booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Arena Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Venue Location
                </span>
                <h3 className="text-lg font-bold text-white">{booking.venueName}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {booking.venueCity}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">
                  Court / Pitch
                </span>
                <h3 className="text-lg font-bold text-emerald-400">{booking.courtName}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reference: <strong className="text-white font-mono">{booking.bookingNumber}</strong>
                </p>
              </div>
            </div>

            {/* Time & Date Columns */}
            <div className="grid grid-cols-3 gap-3 text-center border-y border-slate-800 py-5">
              <div className="border-r border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Date</span>
                <span className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" /> {booking.bookingDate}
                </span>
              </div>
              <div className="border-r border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Start Time</span>
                <span className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> {booking.startTime?.substring(0, 5)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">End Time</span>
                <span className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" /> {booking.endTime?.substring(0, 5)}
                </span>
              </div>
            </div>

            {/* Customer Details & QR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-8 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <strong className="text-white">{booking.customerName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Email:</span>
                  <strong className="text-slate-200">{booking.customerEmail}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway:</span>
                  <strong className="text-emerald-400">Stripe Verified</strong>
                </div>
                <div className="flex justify-between text-slate-200 pt-3 border-t border-slate-800 text-sm">
                  <span className="font-semibold">Total Paid:</span>
                  <strong className="text-xl font-bold text-emerald-400 font-display">₹{booking.totalAmount}</strong>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-20 h-20 bg-white p-1.5 rounded-lg flex items-center justify-center shadow-md">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  Entry Pass QR
                </span>
              </div>

            </div>

          </div>

          <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Present this receipt or state reference #{booking.bookingNumber} upon arrival at the venue reception.
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link to="/customer/bookings" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  );
};
