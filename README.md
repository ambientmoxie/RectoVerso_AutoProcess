# InDesign Recto/Verso Card Generator

## 1. What this script does
- Reads data from a CSV file.  
- Generates **two pages per row**:  
  - **Recto** using master page **A-Recto**  
  - **Verso** using master page **B-Verso**  
- Fills text frames and images automatically.  
- Removes the initial blank page.  

---

## 2. Requirements

### Software
- Adobe InDesign 2026 (important)

### Notion mandatories properties (must match exactly)
```
Name, Cover, Description, Detail, Duration, Index, QR
```

### Master pages (= gabarit) needed in InDesign file
- `A-Recto`  
- `B-Verso`

### Frame labels required
To label an element, click on it then → Window → Utilities → Script Label

#### Recto (A-Recto)
```
nameFrame
descriptionFrame
durationFrame
indexFrame
imageFrame
```

#### Verso (B-Verso)
```
detailFrame
QRFrame
```

### Folder structure
```
Fiches.indd
Data.csv
Images/
    {Cover}.png
QR/
    {QR}.eps
```

---

## 3. How to use

### a. Install the script
Copy the `.jsx` file into the InDesign Scripts Panel folder.  
Open InDesign → **Window → Utilities → Scripts → Right Click on "User" → Open in finder**

### b. Prepare your document
- Open **Fiches.indd**  
- Ensure master pages and labels are correct  
- Ensure the folder structure matches the required layout

### c. Run the script
1. Run the script from the Scripts panel  
2. Select `Data.csv` or any desired database exported from notion
3. The script will generate:
   - Page 1: Recto card 1  
   - Page 2: Verso card 1  
   - Page 3: Recto card 2  
   - Page 4: Verso card 2  
   - etc.

---

## 4. Warning  
**Always work on a full copy of your folder before running the script.**  
The script deletes the first page and generates new pages automatically.
