// script.js
$(document).ready(function () {
  // --- state ---
  let items = [];
  let customerName = '';
  let prevDues = 0;
  let amountPaid = 0;

  // --- DOM elements ---
  const $itemForm = $('#item-form');
  const $cartTbody = $('#cart-table tbody');
  const $totalQty = $('#total-qty');
  const $totalCost = $('#total-cost');
  const $prevDuesInput = $('#prev-dues');
  const $amountPaidInput = $('#amount-paid');
  const $currentDue = $('#current-due');
  const $totalAmount = $('#total-amount');
  const $customerNameInput = $('#customer-name');
  const $itemName = $('#item-name');
  const $itemQty = $('#item-qty');
  const $itemPrice = $('#item-price');

  // --- helpers ---
  function formatCurrency(value) {
    return '₹' + Number(value).toFixed(2);
  }

  function getTotalCost() {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getTotalQty() {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }

  // --- update UI ---
  function updateTotals() {
    const totalCost = getTotalCost();
    const totalQty = getTotalQty();
    const totalAmt = totalCost + prevDues;
    const currentDueVal = totalAmt - amountPaid;

    $totalQty.text(`Total Qty : ${totalQty}`);
    $totalCost.text(`Amount : ${formatCurrency(totalCost)}`);
    $totalAmount.text(`TOTAL : ${formatCurrency(totalAmt)}`);
    $currentDue.text(`Current Due: ${formatCurrency(currentDueVal)}`);
  }

  // --- add item ---
  function addItemToCart(event) {
    event.preventDefault();

    const name = $itemName.val().trim();
    const priceRaw = $itemPrice.val().trim();
    const qtyRaw = $itemQty.val().trim();

    if (!customerName.trim()) {
      alert('Please enter customer name (Bill to).');
      $customerNameInput.focus();
      return;
    }
    if (!name) {
      alert('Please enter item name.');
      $itemName.focus();
      return;
    }
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid item price (greater than 0).');
      $itemPrice.focus();
      return;
    }
    const qty = parseInt(qtyRaw, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity (positive integer).');
      $itemQty.focus();
      return;
    }

    const item = { name, price, qty };
    items.push(item);

    const row = `
      <tr>
        <td>${item.name}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.qty}</td>
        <td>${formatCurrency(item.price * item.qty)}</td>
        <td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td>
      </tr>
    `;
    $cartTbody.append(row);

    updateTotals();
    $itemName.val('');
    $itemQty.val('');
    $itemPrice.val('');
    $itemName.focus();
  }

  // --- remove item ---
  $cartTbody.on('click', '.btn-danger', function () {
    const $row = $(this).closest('tr');
    const index = $row.index();
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      $row.remove();
      updateTotals();
    }
  });

  // --- input events ---
  $customerNameInput.on('input', function () {
    customerName = $(this).val();
  });

  $prevDuesInput.on('input', function () {
    prevDues = parseFloat($(this).val()) || 0;
    updateTotals();
  });

  $amountPaidInput.on('input', function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateTotals();
  });

  // --- form submit & Enter key ---
  $itemForm.on('submit', addItemToCart);

  $('#item-form input').on('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItemToCart(e);
    }
  });

  // --- helpers for invoice ---
  function getCurrentDate() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function getCurrentTime() {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // --- generate invoice ---
  function generateInvoice() {
    if (items.length === 0) {
      alert('Add at least one item to generate invoice.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name (Bill to).');
      $customerNameInput.focus();
      return;
    }

    const totalCost = getTotalCost();
    const totalAmt = totalCost + prevDues;
    const currentDueVal = totalAmt - amountPaid;
    const totalQtyVal = getTotalQty();
    const dateStr = getCurrentDate();
    const timeStr = getCurrentTime();

    let invoiceHTML = `
      <html>
      <head>
        <title>Invoice · Lookman Readymade Centre</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style>
          body { font-family: 'Inter', sans-serif; padding: 2rem 1rem; background: #fff; }
          .invoice-box { max-width: 800px; margin: 0 auto; }
          .header-brand { font-weight: 700; font-size: 1.5rem; letter-spacing: -0.5px; }
          .dotted-hr { border: none; border-top: 2px dotted #888; margin: 0.8rem 0; }
          .table th { font-size: 0.75rem; text-transform: uppercase; color: #2c4b6e; }
          .grand-total { font-size: 1.3rem; font-weight: 700; }
          @media print { .no-print { display: none; } body { padding: 0.5in; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="text-center">
            <h3 class="header-brand mb-0">LOOKMAN READYMADE CENTRE</h3>
            <p class="mb-0 text-muted" style="font-size:0.85rem;">TELHATTA ROAD, SIWAN</p>
            <p class="mb-1 text-muted" style="font-size:0.85rem;">PNo. 7009875235</p>
          </div>
          <hr class="dotted-hr" />
          <div class="d-flex justify-content-between">
            <p class="mb-0"><strong>Bill To:</strong> ${customerName}</p>
            <p class="mb-0"><strong>Date:</strong> ${dateStr}</p>
          </div>
          <div class="d-flex justify-content-between mt-1">
            <span></span>
            <p class="mb-0"><strong>Time:</strong> ${timeStr}</p>
          </div>
          <hr class="dotted-hr" />

          <table class="table table-sm mt-3">
            <thead>
              <tr>
                <th style="text-align:left;">S.N</th>
                <th style="text-align:left;">ITEM</th>
                <th style="text-align:right;">QTY</th>
                <th style="text-align:right;">RATE</th>
                <th style="text-align:right;">AMNT</th>
              </tr>
            </thead>
            <tbody>
    `;

    items.forEach((item, idx) => {
      invoiceHTML += `
              <tr>
                <td style="text-align:left;">${idx + 1}</td>
                <td style="text-align:left;">${item.name}</td>
                <td style="text-align:right;">${item.qty}</td>
                <td style="text-align:right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align:right;">₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>
      `;
    });

    invoiceHTML += `
            </tbody>
          </table>

          <hr class="dotted-hr" />
          <div class="mt-2">
            <p class="mb-1 d-flex justify-content-between"><span>Total Qty:</span> <span>${totalQtyVal}</span></p>
            <p class="mb-1 d-flex justify-content-between"><span>Previous Dues:</span> <span>₹${prevDues.toFixed(2)}</span></p>
            <p class="mb-1 d-flex justify-content-between fw-bold"><span>Total Amount:</span> <span>₹${totalAmt.toFixed(2)}</span></p>
            <p class="mb-1 d-flex justify-content-between"><span>Amount Paid:</span> <span>₹${amountPaid.toFixed(2)}</span></p>
            <p class="mb-1 d-flex justify-content-between fw-bold" style="color:#1e4d7c;"><span>Current Due:</span> <span>₹${currentDueVal.toFixed(2)}</span></p>
          </div>
          <hr class="dotted-hr" />
          <p class="text-center mt-2" style="font-size:0.9rem;">THANKS FOR VISIT</p>

          <div class="text-center mt-3 no-print">
            <button class="btn btn-sm btn-outline-secondary me-2" onclick="window.print()">
              <i class="fas fa-print"></i> Print
            </button>
            <button class="btn btn-sm btn-outline-primary" id="savePdfBtn">
              <i class="fas fa-download"></i> Save as PDF
            </button>
          </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"><\/script>
        <script>
          document.getElementById('savePdfBtn')?.addEventListener('click', function() {
            const element = document.querySelector('.invoice-box');
            html2pdf(element, {
              margin: 0.5,
              filename: 'invoice_lookman.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, letterRendering: true },
              jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            });
          });
        <\/script>
      </body>
      </html>
    `;

    const popup = window.open('', '_blank');
    popup.document.open();
    popup.document.write(invoiceHTML);
    popup.document.close();
  }

  // --- bind invoice button ---
  $('#generate-invoice').on('click', generateInvoice);

  // --- initialize ---
  updateTotals();
});
