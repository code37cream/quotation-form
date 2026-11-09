
    const VAT_RATE = 0.07;

    const currency = new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const itemTable = document.querySelector('#itemTable');
    const itemBody = itemTable.querySelector('tbody');
    const page = document.querySelector('#quotationPage');

    /* ใส่เลขที่และวันที่ปัจจุบัน */
    function setDocumentDefaults() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        document.querySelector('#quotationNumber').textContent =
            `QT-${yyyy}${mm}${dd}-01`;

        document.querySelector('#quotationDate').textContent =
            `${dd}/${mm}/${yyyy + 543}`;
    }

    /* คำนวณราคาต่อหน่วยและ VAT โดยตรวจสอบว่าคอลัมน์ยังอยู่หรือไม่ */
    function calculateTotal() {
        itemBody.querySelectorAll('tr').forEach((row) => {
            const qtyInput = row.querySelector('[data-key="qty"] input');
            const priceInput = row.querySelector('[data-key="price"] input');
            const feeInput = row.querySelector('[data-key="fee"] input');
            const unitInput = row.querySelector('[data-key="unit-price"] input');
            const vatInput = row.querySelector('[data-key="vat-unit-price"] input');

            const quantity = qtyInput ? (Number(qtyInput.value) || 0) : 0;
            const plasticPrice = priceInput ? (Number(priceInput.value) || 0) : 0;
            const productionFee = feeInput ? (Number(feeInput.value) || 0) : 0;
            const unit = unitInput ? (Number(unitInput.value) || 0) : 0;
            const vationFee = vatInput ? (Number(vatInput.value) || 0) : 0;

            const unitPrice = plasticPrice + productionFee;
            const vatUnitPrice = unitPrice * (1 + VAT_RATE);



            if (unitCell) unitCell.textContent = currency.format(unitPrice);
            if (vatCell) vatCell.textContent = currency.format(vatUnitPrice);

            /* เก็บยอดรวมต่อแถวไว้เป็น data เผื่อใช้งานต่อ โดยไม่เพิ่มคอลัมน์ที่มองเห็น */
            row.dataset.rowTotal = (quantity * unitPrice).toFixed(2);
        });
    }

    /* สร้างเซลล์ตามคอลัมน์ที่ยังเหลืออยู่ในหัวตาราง */
    function createCellForKey(key) {
        const td = document.createElement('td');
        td.dataset.key = key;

        switch (key) {

            case 'code':
                    td.className = 'code';
                    td.contentEditable = 'true';
                    td.textContent = 'รหัสสินค้า';
                    break;

            case 'description':
                td.className = 'description';
                td.contentEditable = 'true';
                td.textContent = 'ระบุรายละเอียดสินค้า';
                break;

            case 'qty':
                td.innerHTML = '<input type="number" value="1" min="0" step="any" class="qty" aria-label="น้ำหนักต่อครั้ง">';
                break;

            case 'price':
                td.innerHTML = '<input type="number" value="0" min="0" step="any" class="price" aria-label="ราคาเม็ดพลาสติก">';
                break;

            case 'fee':
                td.innerHTML = '<input type="number" value="0" min="0" step="any" class="fee" aria-label="ค่าผลิตและค่าแม่สี">';
                break;

            case 'unit-price':
                td.innerHTML = '<input type="number" value="0" min="0" step="any" class="unit-price" aria-label="ราคา(บาท/กก.)">';
                break;

            case 'vat-unit-price':
                td.innerHTML = '<input type="number" value="0" min="0" step="any" class="vat-unit-price" aria-label="รวมVat(บาท/กก.)">';
                break;

            case 'actions':
                td.className = 'no-print action-column';
                td.innerHTML = '<button type="button" class="btn-delete" aria-label="ลบรายการ">ลบ</button>';
                break;
        }

        return td;
    }

    /* เพิ่มแถวรายการสินค้า โดยยึดคอลัมน์ที่เหลืออยู่จริง */
    function addRow() {
        const row = document.createElement('tr');
        const headers = itemTable.querySelectorAll('thead th');

        headers.forEach((header) => {
            const key = header.dataset.key;
            if (key) row.appendChild(createCellForKey(key));
        });

        itemBody.appendChild(row);
        calculateTotal();
    }

    /* ลบคอลัมน์ที่เลือก ทั้งหัวตารางและข้อมูลทุกแถว */
    itemTable.querySelector('thead').addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-column');
        if (!deleteButton) return;

        const header = deleteButton.closest('th');
        if (!header || header.dataset.key === 'actions') return;

        const remainingColumns = itemTable.querySelectorAll(
            'thead th:not(.action-column)'
        ).length;

        if (remainingColumns <= 1) {
            alert('ต้องเหลือคอลัมน์สินค้าอย่างน้อย 1 คอลัมน์');
            return;
        }

        const key = header.dataset.key;
        const headerName = header.querySelector('.th-label')
            ? header.querySelector('.th-label').innerText.trim()
            : 'คอลัมน์นี้';

        if (!confirm(`ต้องการลบคอลัมน์ "${headerName}" และข้อมูลในคอลัมน์นี้ทั้งหมดใช่หรือไม่?`)) {
            return;
        }

        header.remove();

        itemBody.querySelectorAll('tr').forEach((row) => {
            const cell = row.querySelector(`td[data-key="${key}"]`);
            if (cell) cell.remove();
        });

        calculateTotal();
    });

    /* ปรับขนาดคอลัมน์ด้วยการลากขอบหัวตาราง */
    function enableColumnResizing() {
        itemTable.addEventListener('pointerdown', function(event) {
            const header = event.target.closest('thead th');

            if (!header || header.classList.contains('action-column')) return;

            /* ไม่เริ่มลากเมื่อคลิกปุ่มลบหรือกำลังแก้ไขข้อความ */
            if (event.target.closest('.delete-column') ||
                event.target.closest('.th-label')) {
                const bounds = header.getBoundingClientRect();
                if (bounds.right - event.clientX > 9) return;
            }

            const bounds = header.getBoundingClientRect();

            if (bounds.right - event.clientX > 9) return;

            event.preventDefault();

            const startX = event.clientX;
            const startWidth = bounds.width;
            const tableWidth = itemTable.getBoundingClientRect().width;

            function resize(moveEvent) {
                const newWidth = Math.max(
                    48,
                    startWidth + moveEvent.clientX - startX
                );

                header.style.width = `${(newWidth / tableWidth) * 100}%`;
            }

            function stopResize() {
                document.removeEventListener('pointermove', resize);
                document.removeEventListener('pointerup', stopResize);
                document.removeEventListener('pointercancel', stopResize);
            }

            document.addEventListener('pointermove', resize);
            document.addEventListener('pointerup', stopResize);
            document.addEventListener('pointercancel', stopResize);
        });
    }

          /* เปลี่ยนรูปแบบตัวอักษรเฉพาะตารางสินค้า */
        document.querySelector('#fontFamily').addEventListener('change', (event) => {
            const itemTable = document.querySelector('#itemTable');

            if (itemTable) {
                itemTable.style.setProperty(
                    '--table-font-family',
                    event.target.value
                );
            }
        });

        /* เปลี่ยนขนาดตัวอักษรเฉพาะตารางสินค้า */
        document.querySelector('#fontSize').addEventListener('input', (event) => {
            const itemTable = document.querySelector('#itemTable');

            if (itemTable) {
                itemTable.style.setProperty(
                    '--table-font-size',
                    `${event.target.value}px`
                );
            }

            document.querySelector('#fontSizeVal').textContent =
                `${event.target.value} px`;
        });


    /* เปลี่ยนขนาดกระดาษและระยะขอบ */
    const printSettings = document.createElement('style');
    document.head.appendChild(printSettings);

    function applyPrintSettings() {
        const margin = `${document.querySelector('#pageMargin').value}mm`;

        document.documentElement.style.setProperty('--paper-margin', margin);

        printSettings.textContent =
            `@page { size: A4 portrait; margin: ${margin}; }`;
    }

    document.querySelector('#pageSize').addEventListener('change', applyPrintSettings);

    document.querySelector('#pageMargin').addEventListener('input', (event) => {
        document.querySelector('#marginVal').textContent =
            `${event.target.value} มม.`;

        applyPrintSettings();
    });

    /* เลือกรูปแบนเนอร์ */
    document.querySelector('#bannerFile').addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            event.target.value = '';
            return;
        }

        const image = document.querySelector('#quotationBanner');
        const placeholder = document.querySelector('#bannerPlaceholder');

        if (image.dataset.objectUrl) {
            URL.revokeObjectURL(image.dataset.objectUrl);
        }

        const objectUrl = URL.createObjectURL(file);

        image.src = objectUrl;
        image.dataset.objectUrl = objectUrl;
        image.hidden = false;

        placeholder.hidden = true;
    });

    /* ปุ่มเพิ่มรายการ */
    document.querySelector('#addRow').addEventListener('click', addRow);

    /* คำนวณใหม่เมื่อแก้ไขตัวเลข */
    itemBody.addEventListener('input', (event) => {
        if (event.target.matches('.qty, .price, .fee')) {
            calculateTotal();
        }
    });

    /* ลบรายการสินค้า */
    itemBody.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-delete');
        if (!deleteButton) return;

        const row = deleteButton.closest('tr');

        if (row) {
            row.remove();
            calculateTotal();
        }
    });

/*--------- ลากย้ายตำแหน่ง SIGNATURE BOX----------------*/

    const signatureBox = document.querySelector('.signature-box');
    const resetSignature = document.querySelector('#resetSignature');

    let signatureDragging = false;
    let signatureStartX = 0;
    let signatureStartY = 0;
    let signatureOffsetX = 0;
    let signatureOffsetY = 0;

    signatureBox.addEventListener('pointerdown', function(event) {

        if (event.target.closest('button')) return;

        signatureDragging = true;

        signatureStartX = event.clientX;
        signatureStartY = event.clientY;

        const transform = signatureBox.style.transform;
        const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);

        signatureOffsetX = match ? Number(match[1]) : 0;
        signatureOffsetY = match ? Number(match[2]) : 0;

        signatureBox.classList.add('dragging');

        signatureBox.setPointerCapture(event.pointerId);

        event.preventDefault();
    });

    signatureBox.addEventListener('pointermove', function(event) {

        if (!signatureDragging) return;

        const moveX = event.clientX - signatureStartX;
        const moveY = event.clientY - signatureStartY;

        signatureBox.style.transform =
            `translate(${signatureOffsetX + moveX}px, ${signatureOffsetY + moveY}px)`;
    });

    function stopSignatureDragging() {
        signatureDragging = false;
        signatureBox.classList.remove('dragging');
    }

    signatureBox.addEventListener('pointerup', stopSignatureDragging);
    signatureBox.addEventListener('pointercancel', stopSignatureDragging);

    /* รีเซ็ตตำแหน่ง */
    resetSignature.addEventListener('click', function() {

        signatureBox.style.transform = 'translate(0px, 0px)';

    });

    /* พิมพ์ใบเสนอราคา */
    window.addEventListener('beforeprint', function() {
        signatureBox.classList.remove('dragging');
    });

    document.querySelectorAll('input[type="number"]').forEach(function (input) {

      input.addEventListener('input', function () {
          this.value = this.value.replace(/,/g, '');
      });

  });

    const notesBox = document.querySelector('.quotation-notes');
     const resetNotes = document.querySelector('#resetNotes'); // ถ้ามีปุ่มรีเซ็ตของหมายเหตุด้วย

     let notesDragging = false;
     let notesStartX = 0;
     let notesStartY = 0;
     let notesOffsetX = 0;
     let notesOffsetY = 0;

     notesBox.addEventListener('pointerdown', function(event) {
         // ถ้าคลิกโดนช่องพิมพ์ข้อความ (contenteditable) หรือปุ่ม ให้ยอมให้พิมพ์/กดปุ่มตามปกติ (ไม่ลาก)
         if (event.target.closest('[contenteditable="true"]') || event.target.closest('button')) return;

         notesDragging = true;

         notesStartX = event.clientX;
         notesStartY = event.clientY;

         const transform = notesBox.style.transform;
         const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);

         notesOffsetX = match ? Number(match[1]) : 0;
         notesOffsetY = match ? Number(match[2]) : 0;

         notesBox.classList.add('dragging');
         notesBox.setPointerCapture(event.pointerId);

         event.preventDefault();
     });

     notesBox.addEventListener('pointermove', function(event) {
         if (!notesDragging) return;

         const moveX = event.clientX - notesStartX;
         const moveY = event.clientY - notesStartY;

         notesBox.style.transform =
             `translate(${notesOffsetX + moveX}px, ${notesOffsetY + moveY}px)`;
     });

     function stopNotesDragging(event) {
         if (!notesDragging) return;
         notesDragging = false;
         notesBox.classList.remove('dragging');
         try {
             notesBox.releasePointerCapture(event.pointerId);
         } catch (e) {}
     }

     notesBox.addEventListener('pointerup', stopNotesDragging);
     notesBox.addEventListener('pointercancel', stopNotesDragging);

     /* ปุ่มรีเซ็ตตำแหน่งหมายเหตุ (ถ้ามี) */
     if (resetNotes) {
         resetNotes.addEventListener('click', function() {
             notesBox.style.transform = 'translate(0px, 0px)';
         });
     }
     document.addEventListener('DOMContentLoaded', function() {
      // ฟังก์ชันจัดรูปแบบตัวเลขใส่คอมมา (รองรับทศนิยม)
      function formatNumber(value) {
          if (!value) return '';
          // ลบเครื่องหมายคอมมาเก่าออกก่อน
          let cleanValue = value.toString().replace(/,/g, '');
          let parts = cleanValue.split('.');

          // ใส่คอมมาให้เลขจำนวนเต็ม
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

          // รวมกลับกับทศนิยม (ถ้ามี)
          return parts.join('.');
      }

      // ฟังก์ชันดึงค่าตัวเลขดิบไปใช้งานคำนวณ
      window.getRawValue = function(inputElement) {
          return parseFloat(inputElement.value.replace(/,/g, '')) || 0;
      };

      const inputs = document.querySelectorAll('.formatted-number');

      inputs.forEach(input => {
          // จัดรูปแบบค่าเริ่มต้นที่มีอยู่ก่อน
          if (input.value) {
              input.value = formatNumber(input.value);
          }

          // เมื่อคลิกเข้ามาแก้ไข: เอาคอมมาออกเพื่อให้พิมพ์ตัวเลขง่ายๆ
          input.addEventListener('focus', function() {
              this.value = this.value.replace(/,/g, '');
              this.select(); // Hilight ข้อความทั้งหมดเพื่อให้แก้สะดวก
          });

          // เมื่อคลิกออกไปช่องอื่น (Blur): จัดรูปแบบใส่คอมมากลับเข้าไป
          input.addEventListener('blur', function() {
              this.value = formatNumber(this.value);
          });
      });
  });



    /* เริ่มต้นระบบ */
    applyPrintSettings();
    setDocumentDefaults();
    enableColumnResizing();
    calculateTotal();
