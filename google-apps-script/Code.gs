const RSVP_SHEET = 'RSVP';
const WISH_SHEET = 'Wishes';

function setupWeddingSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, RSVP_SHEET, ['Submission ID','Timestamp','Name','Guests','Event','Attendance','Phone','Message']);
  ensureSheet_(ss, WISH_SHEET, ['Submission ID','Timestamp','Name','Wish','Status']);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    setupWeddingSheets();
    const p = e.parameter || {};
    const id = clean_(p.id, 80);
    const type = clean_(p.type, 12);
    if (!/^[A-Za-z0-9_-]{12,80}$/.test(id)) return json_({ok:false,error:'invalid_id'});
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (find_(ss, id)) return json_({ok:true,id:id,duplicate:true});
    if (type === 'rsvp') {
      ss.getSheetByName(RSVP_SHEET).appendRow([id,new Date(),clean_(p.name,80),Math.max(1,Math.min(20,Number(p.guests||1))),clean_(p.event,50),clean_(p.attendance,50),clean_(p.phone,30),clean_(p.message,500)]);
    } else if (type === 'wish') {
      ss.getSheetByName(WISH_SHEET).appendRow([id,new Date(),clean_(p.name,80),clean_(p.wish,500),'Pending']);
    } else return json_({ok:false,error:'invalid_type'});
    SpreadsheetApp.flush();
    return json_({ok:true,id:id});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  } finally { lock.releaseLock(); }
}

function doGet(e) {
  setupWeddingSheets();
  const p=e.parameter||{};
  const callback=String(p.callback||'callback').replace(/[^A-Za-z0-9_.$]/g,'');
  let out;
  if (p.action === 'health') out={ok:true};
  else if (p.action === 'status') out={ok:true,saved:!!find_(SpreadsheetApp.getActiveSpreadsheet(),clean_(p.id,80))};
  else if (p.action === 'wishes') out={ok:true,wishes:approvedWishes_()};
  else out={ok:true,service:'Lan Chung Wedding API'};
  return ContentService.createTextOutput(callback+'('+JSON.stringify(out)+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function approvedWishes_(){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET);
  if(!sh||sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,5).getValues().filter(r=>String(r[4]).toLowerCase()==='approved').slice(-50).reverse().map(r=>({name:String(r[2]),wish:String(r[3])}));
}
function find_(ss,id){for(const name of [RSVP_SHEET,WISH_SHEET]){const sh=ss.getSheetByName(name);if(!sh||sh.getLastRow()<2)continue;const f=sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext();if(f)return true}return false}
function ensureSheet_(ss,name,headers){let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0){sh.appendRow(headers);sh.setFrozenRows(1);sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#397f7d').setFontColor('#fff');sh.autoResizeColumns(1,headers.length)}}
function clean_(v,max){return String(v||'').replace(/[<>]/g,'').trim().slice(0,max)}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
