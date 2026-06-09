"""
Script untuk import property_images ke production database
"""
import json
import os

def main():
    print("=== IMPORT PROPERTY IMAGES TO PRODUCTION ===\n")
    
    export_file = 'property_images_export.json'
    
    if not os.path.exists(export_file):
        print(f"File not found: {export_file}")
        return
    
    with open(export_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle JSON structure
    if isinstance(data, list) and len(data) > 0:
        images = data[0].get('results', [])
    elif isinstance(data, dict):
        images = data.get('results', [])
    else:
        images = []
    
    print(f"Found {len(images)} images to import")
    
    if len(images) == 0:
        print("No images to import!")
        return
    
    # Create SQL INSERT statements
    sql_statements = []
    
    for img in images:
        def escape(val):
            if val is None:
                return 'NULL'
            return "'" + str(val).replace("'", "''") + "'"
        
        sql = f"""INSERT OR IGNORE INTO property_images (
            id, property_id, image_url, is_primary, sort_order
        ) VALUES (
            {escape(img.get('id'))},
            {escape(img.get('property_id'))},
            {escape(img.get('image_url'))},
            {img.get('is_primary') or 0},
            {img.get('sort_order') or 0}
        );"""
        
        sql_statements.append(sql)
    
    # Save to file
    output_file = 'import_property_images.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"Created {output_file} with {len(sql_statements)} INSERT statements")
    print("\nTo import to production, run:")
    print(f"  wrangler d1 execute salambumi-property-db --remote --file={output_file}")

if __name__ == '__main__':
    main()
