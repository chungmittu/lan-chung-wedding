const RSVP_SHEET = 'RSVP';
const WISH_SHEET = 'Wishes';


/**
 * Tạo và chuẩn hóa hai sheet RSVP và Wishes.
 * Chạy thủ công một lần sau khi tạo Apps Script.
 */
function setupWeddingSheets() {
  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet_(
    spreadsheet,
    RSVP_SHEET,
    [
      'Submission ID',
      'Timestamp',
      'Name',
      'Guests',
      'Event',
      'Attendance',
      'Phone',
      'Message'
    ]
  );

  ensureSheet_(
    spreadsheet,
    WISH_SHEET,
    [
      'Submission ID',
      'Timestamp',
      'Name',
      'Wish',
      'Status'
    ]
  );
}


/**
 * Nhận RSVP và lời chúc từ website.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    setupWeddingSheets();

    const parameters = e && e.parameter
      ? e.parameter
      : {};

    const submissionId =
      clean_(parameters.id, 80);

    const submissionType =
      clean_(parameters.type, 12)
        .toLowerCase();

    if (
      !submissionId ||
      !/^[A-Za-z0-9_-]{12,80}$/.test(submissionId)
    ) {
      return json_({
        ok: false,
        error: 'invalid_id'
      });
    }

    const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet();

    /*
     * Chống ghi trùng khi frontend gửi lại
     * cùng Submission ID.
     */
    if (find_(spreadsheet, submissionId)) {
      return json_({
        ok: true,
        id: submissionId,
        duplicate: true
      });
    }

    if (submissionType === 'rsvp') {
      saveRsvp_(
        spreadsheet,
        submissionId,
        parameters
      );
    } else if (submissionType === 'wish') {
      saveWish_(
        spreadsheet,
        submissionId,
        parameters
      );
    } else {
      return json_({
        ok: false,
        error: 'invalid_type'
      });
    }

    SpreadsheetApp.flush();

    return json_({
      ok: true,
      id: submissionId,
      saved: true
    });
  } catch (error) {
    return json_({
      ok: false,
      error: String(
        error && error.message
          ? error.message
          : error
      )
    });
  } finally {
    /*
     * Chỉ giải phóng nếu script đã lấy được lock.
     */
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}


/**
 * Endpoint phục vụ:
 *
 * ?action=health
 * ?action=status&id=...
 * ?action=wishes
 *
 * Frontend gọi bằng JSONP.
 */
function doGet(e) {
  setupWeddingSheets();

  const parameters = e && e.parameter
    ? e.parameter
    : {};

  const action =
    clean_(parameters.action, 20)
      .toLowerCase();

  let callback =
    String(parameters.callback || 'callback')
      .replace(/[^A-Za-z0-9_.$]/g, '');

  if (!callback) {
    callback = 'callback';
  }

  let output;

  if (action === 'health') {
    output = {
      ok: true,
      service: 'Lan Chung Wedding API',
      timestamp: new Date().toISOString()
    };
  } else if (action === 'status') {
    const submissionId =
      clean_(parameters.id, 80);

    output = {
      ok: true,
      saved: Boolean(
        find_(
          SpreadsheetApp.getActiveSpreadsheet(),
          submissionId
        )
      )
    };
  } else if (action === 'wishes') {
    output = {
      ok: true,
      wishes: approvedWishes_()
    };
  } else {
    output = {
      ok: true,
      service: 'Lan Chung Wedding API'
    };
  }

  return ContentService
    .createTextOutput(
      callback +
      '(' +
      JSON.stringify(output) +
      ')'
    )
    .setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
}


/**
 * Lưu RSVP.
 */
function saveRsvp_(
  spreadsheet,
  submissionId,
  parameters
) {
  const name =
    clean_(parameters.name, 80);

  const event =
    clean_(parameters.event, 50);

  const attendance =
    clean_(parameters.attendance, 50);

  if (!name) {
    throw new Error(
      'Tên khách mời không được để trống'
    );
  }

  if (!event) {
    throw new Error(
      'Sự kiện không được để trống'
    );
  }

  if (!attendance) {
    throw new Error(
      'Trạng thái tham dự không được để trống'
    );
  }

  let guests =
    Number(parameters.guests || 1);

  if (!Number.isFinite(guests)) {
    guests = 1;
  }

  guests = Math.round(guests);
  guests = Math.max(1, Math.min(20, guests));

  spreadsheet
    .getSheetByName(RSVP_SHEET)
    .appendRow([
      submissionId,
      new Date(),
      name,
      guests,
      event,
      attendance,
      clean_(parameters.phone, 30),
      clean_(parameters.message, 500)
    ]);
}


/**
 * Lưu lời chúc.
 *
 * Approved giúp lời chúc tự động xuất hiện
 * trên website sau khi gửi.
 */
function saveWish_(
  spreadsheet,
  submissionId,
  parameters
) {
  const name =
    clean_(parameters.name, 80);

  const wish =
    clean_(parameters.wish, 500);

  if (!name) {
    throw new Error(
      'Tên khách mời không được để trống'
    );
  }

  if (!wish) {
    throw new Error(
      'Lời chúc không được để trống'
    );
  }

  spreadsheet
    .getSheetByName(WISH_SHEET)
    .appendRow([
      submissionId,
      new Date(),
      name,
      wish,

      /*
       * Tự động hiển thị trên website.
       */
      'Approved'
    ]);
}


/**
 * Lấy tối đa 50 lời chúc Approved mới nhất.
 */
function approvedWishes_() {
  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    spreadsheet.getSheetByName(WISH_SHEET);

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  const rowCount =
    sheet.getLastRow() - 1;

  const rows =
    sheet
      .getRange(
        2,
        1,
        rowCount,
        5
      )
      .getValues();

  return rows
    .filter(row => {
      const status =
        String(row[4] || '')
          .trim()
          .toLowerCase();

      return status === 'approved';
    })
    .slice(-50)
    .reverse()
    .map(row => ({
      id: String(row[0] || ''),
      timestamp:
        row[1] instanceof Date
          ? row[1].toISOString()
          : String(row[1] || ''),
      name: String(row[2] || ''),
      wish: String(row[3] || '')
    }));
}


/**
 * Tìm Submission ID trong cả hai sheet.
 */
function find_(spreadsheet, submissionId) {
  if (!submissionId) {
    return false;
  }

  const sheetNames = [
    RSVP_SHEET,
    WISH_SHEET
  ];

  for (const sheetName of sheetNames) {
    const sheet =
      spreadsheet.getSheetByName(sheetName);

    if (!sheet || sheet.getLastRow() < 2) {
      continue;
    }

    const found =
      sheet
        .getRange(
          2,
          1,
          sheet.getLastRow() - 1,
          1
        )
        .createTextFinder(submissionId)
        .matchEntireCell(true)
        .findNext();

    if (found) {
      return true;
    }
  }

  return false;
}


/**
 * Tạo sheet và dòng tiêu đề nếu chưa có.
 */
function ensureSheet_(
  spreadsheet,
  sheetName,
  headers
) {
  let sheet =
    spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  /*
   * Chuẩn hóa tiêu đề kể cả khi sheet đã có.
   */
  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#397f7d')
    .setFontColor('#ffffff');

  sheet.setFrozenRows(1);
}


/**
 * Làm sạch chuỗi đầu vào.
 */
function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}


/**
 * Trả JSON cho POST.
 */
function json_(data) {
  return ContentService
    .createTextOutput(
      JSON.stringify(data)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}


/**
 * Chạy một lần nếu muốn duyệt toàn bộ
 * lời chúc Pending đã có.
 */
function approveAllPendingWishes() {
  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    spreadsheet.getSheetByName(WISH_SHEET);

  if (!sheet || sheet.getLastRow() < 2) {
    return;
  }

  const statusRange =
    sheet.getRange(
      2,
      5,
      sheet.getLastRow() - 1,
      1
    );

  const statuses =
    statusRange.getValues();

  const updatedStatuses =
    statuses.map(row => {
      const status =
        String(row[0] || '')
          .trim()
          .toLowerCase();

      if (status === 'pending') {
        return ['Approved'];
      }

      return [row[0]];
    });

  statusRange.setValues(updatedStatuses);

  SpreadsheetApp.flush();
}
