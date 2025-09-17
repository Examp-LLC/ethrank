import re

def transform_sql(input_file, output_file):
    with open(input_file, 'r') as file:
        content = file.read()

    # Replace backticks with double quotes
    content = re.sub(r'`', '"', content)
    
    # Replace `id` int NOT NULL AUTO_INCREMENT with `id` SERIAL PRIMARY KEY
    content = re.sub(r'"id" int NOT NULL AUTO_INCREMENT', '"id" SERIAL PRIMARY KEY', content, flags=re.IGNORECASE)
    
    # Replace any remaining AUTO_INCREMENT with SERIAL (general case)
    content = re.sub(r'\bAUTO_INCREMENT\b', 'SERIAL', content, flags=re.IGNORECASE)
    
    # Remove ENGINE definitions
    content = re.sub(r'ENGINE=\w+\s*', '', content, flags=re.IGNORECASE)
    
    # Replace ENUM with CHECK constraint (simple example, may need further adjustment)
    content = re.sub(r'\bENUM\((.*?)\)', r'CHECK(\1)', content, flags=re.IGNORECASE)
    
    # Replace double quotes inside values with escaped single quotes
    content = re.sub(r'\\\\"', r"''", content)

    # Remove CHARACTER SET and COLLATE definitions
    content = re.sub(r' CHARACTER SET \w+', '', content, flags=re.IGNORECASE)
    content = re.sub(r' COLLATE \w+', '', content, flags=re.IGNORECASE)

    # Save the transformed content to a new file
    with open(output_file, 'w') as file:
        file.write(content)

# Usage
input_file = 'pscale_dump_ethrank_main/ethrank.Address-schema.sql'
output_file = 'transformed_ethrank.Address-schema.sql'
transform_sql(input_file, output_file)
