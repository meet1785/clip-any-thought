# Keyboard Shortcuts - Manual Testing Guide

## Test Environment Setup
1. Start the dev server: `npm run dev`
2. Open http://localhost:8080 in your browser
3. Navigate to the "Try It Now" section

## Test Cases

### Test 1: Show Keyboard Shortcuts Help
**Steps:**
1. Press the `?` key anywhere on the page
2. Verify the keyboard shortcuts help dialog appears
3. Check that all shortcuts are listed with proper formatting
4. Press `?` again to close the dialog
5. Press `Escape` to close if it's still open

**Expected Result:** ✅ Dialog opens and closes properly

---

### Test 2: Generate Clips with Cmd/Ctrl+Enter
**Steps:**
1. Enter a YouTube URL in the input field: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. While focus is in the input field, press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux)
3. Verify the "Generate Viral Clips" process starts

**Expected Result:** ✅ Clips generation begins even though focus is in input field

---

### Test 3: Navigate Clips with Arrow Keys
**Steps:**
1. Generate clips from a YouTube video (wait for completion)
2. Press `↓` (down arrow) key
3. Verify the first clip gets a ring highlight and "Selected" badge
4. Press `↓` again to move to the next clip
5. Press `↑` (up arrow) to move back to previous clip
6. Continue pressing `↓` past the last clip

**Expected Result:** ✅ 
- Selection moves between clips with visual feedback
- Smooth scroll animation to selected clip
- Navigation wraps around (last → first, first → last)

---

### Test 4: Toggle Clip Editor with 'E'
**Steps:**
1. Ensure clips are generated and one is selected
2. Press `e` key
3. Verify the clip editor expands below the selected clip
4. Press `e` again
5. Verify the clip editor closes

**Expected Result:** ✅ Editor toggles open/close for selected clip

---

### Test 5: Preview Clip with 'P'
**Steps:**
1. Select a clip using arrow keys or clicking
2. Press `p` key
3. Verify a new tab opens with the YouTube video starting at the clip's timestamp
4. Check that the new tab doesn't have access to the parent window (security)

**Expected Result:** ✅ 
- New tab opens with correct timestamp
- URL has `noopener,noreferrer` flags (check in network tab)

---

### Test 6: Close Editor with Escape
**Steps:**
1. Open the clip editor for a clip (press `e` or click "Edit & Download")
2. Press `Escape` key
3. Verify the clip editor closes

**Expected Result:** ✅ Editor closes when Escape is pressed

---

### Test 7: Keyboard Shortcuts Don't Interfere with Typing
**Steps:**
1. Click in the "YouTube Video URL" input field
2. Type `e`, `p`, `↓`, `↑` characters
3. Verify these characters appear in the input field
4. Don't trigger any shortcuts (except Cmd/Ctrl+Enter which is allowed)

**Expected Result:** ✅ Normal typing works, shortcuts don't interfere

---

### Test 8: Visual Indicators
**Steps:**
1. Generate clips from a video
2. Check for the keyboard icon button next to "Generate Viral Clips"
3. Look for "Press ? for keyboard shortcuts" hint text
4. Select a clip and verify the "Selected" badge appears
5. Check for accent ring around selected clip

**Expected Result:** ✅ All visual indicators are present and clear

---

### Test 9: Keyboard Button Click
**Steps:**
1. Click the keyboard icon button (⌨️) in the main form
2. Verify the shortcuts help dialog opens
3. Close the dialog

**Expected Result:** ✅ Dialog opens via button click

---

### Test 10: Cross-Platform Modifier Keys
**Steps:**
1. On Mac: Test with `Cmd+Enter`
2. On Windows/Linux: Test with `Ctrl+Enter`
3. Both should trigger clip generation

**Expected Result:** ✅ Both Cmd and Ctrl work for the same shortcut

---

## Browser Compatibility Tests

Test the above in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Edge

## Accessibility Tests

- [ ] Shortcuts work with screen readers enabled
- [ ] Focus indicators are visible when navigating with keyboard
- [ ] Help dialog is accessible via keyboard navigation

## Performance Tests

- [ ] Shortcuts respond immediately (< 100ms)
- [ ] No lag when navigating through many clips (10+ clips)
- [ ] Smooth scroll animation doesn't cause jank

---

## Test Results Summary

**Date Tested:** _____________  
**Browser:** _____________  
**OS:** _____________  
**Tester:** _____________

### Results:
- [ ] All tests passed
- [ ] Some tests failed (list below)

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
