"""
Script untuk import properties dari local ke production database
"""
import json
import subprocess
import sys

def main():
    print("=== IMPORT PROPERTIES TO PRODUCTION ===\n")
    
    # Read exported JSON - use current directory
    import os
    export_file = os.path.join(os.path.dirname(__file__), '..', 'properties_export.json')
    
    if not os.path.exists(export_file):
        print(f"File not found: {export_file}")
        print("Please export first with: wrangler d1 execute salambumi-property-db --local --command \"SELECT * FROM properties\" --json > properties_export.json")
        return
    
    with open(export_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle different JSON structures
    if isinstance(data, list) and len(data) > 0:
        properties = data[0].get('results', [])
    elif isinstance(data, dict):
        properties = data.get('results', [])
    else:
        properties = []
    
    print(f"Found {len(properties)} properties to import")
    
    if len(properties) == 0:
        print("No properties to import!")
        return
    
    # Create SQL INSERT statements
    sql_statements = []
    
    for prop in properties:
        # Escape single quotes
        def escape(val):
            if val is None:
                return 'NULL'
            return "'" + str(val).replace("'", "''") + "'"
        
        sql = f"""INSERT OR IGNORE INTO properties (
            id, listing_code, title, slug, purpose, property_type,
            price_offer, price_rent, province, city, district, address,
            land_area, building_area, bedrooms, bathrooms, description,
            status, created_at, updated_at
        ) VALUES (
            {escape(prop.get('id'))},
            {escape(prop.get('listing_code'))},
            {escape(prop.get('title'))},
            {escape(prop.get('slug'))},
            {escape(prop.get('purpose'))},
            {escape(prop.get('property_type'))},
            {prop.get('price_offer') or 0},
            {prop.get('price_rent') or 0},
            {escape(prop.get('province'))},
            {escape(prop.get('city'))},
            {escape(prop.get('district'))},
            {escape(prop.get('address'))},
            {prop.get('land_area') or 0},
            {prop.get('building_area') or 0},
            {prop.get('bedrooms') or 0},
            {prop.get('bathrooms') or 0},
            {escape(prop.get('description'))},
            'active',
            datetime('now'),
            datetime('now')
        );"""
        
        sql_statements.append(sql)
    
    # Save to file
    output_file = 'import_properties.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"Created {output_file} with {len(sql_statements)} INSERT statements")
    print("\nTo import to production, run:")
    print(f"  wrangler d1 execute salambumi-property-db --remote --file={output_file}")

if __name__ == '__main__':
    main()
