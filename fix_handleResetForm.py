# Fix handleResetForm to include kecamatan and kelurahan

file_path = r'd:\Backup Web SBP\SBP 08-02-2026\SBP-main\SBP-main\client\src\components\admin\ProductionPropertyForm.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace in handleResetForm - add kecamatan and kelurahan after kabupaten
old_text = '''      kabupaten: "",
      alamat_lengkaps: "",'''

new_text = '''      kabupaten: "",
      kecamatan: "",
      kelurahan: "",
      alamat_lengkaps: "",'''

if old_text in content:
    content = content.replace(old_text, new_text)
    print("Added kecamatan and kelurahan to handleResetForm!")
else:
    print("Pattern not found - trying different approach")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
