const fs = require('fs');
const csv = require('csv-parser');

// Input CSV file path
const csvFilePath = 'tallyfo_fd.csv'; // Replace with your CSV file path

// Output JSON structure
const jsonOutput = {
    name: "TallyFO Form",
    code_name: "tallyfo_form",
    data_source: ["TALLYFO_WEB"],
    section_list: []
};

// Map to track sections by their codename
const sectionMap = new Map();

fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        const {
            section_name,
            section_codename,
            field_label,
            field_name,
            row_position,
            column_position,
            required
        } = row;

        // Find or create the section
        if (!sectionMap.has(section_codename)) {
            const section = {
                name: section_name,
                code_name: section_codename,
                row_position: 0, // Will update later based on index
                column_position: 1, // Default or compute as needed
                field_list: []
            };
            sectionMap.set(section_codename, section);
            jsonOutput.section_list.push(section);
        }

        // Add the field to the section's field list
        const section = sectionMap.get(section_codename);
        section.field_list.push({
            label: field_label,
            name: field_name,
            row_position: row_position, 
            column_position: column_position,
            min_value: null,
            max_value: null,
            is_required: false,
            dependent_child: null,
            regex: null,
            sub_dp: [],
            is_editable: true
        });
    })
    .on('end', () => {
        jsonOutput.section_list.forEach((section, sectionIndex) => {
            section.row_position = sectionIndex + 1; // Update section row_position

            section.field_list.forEach((field, fieldIndex) => {
                field.row_position = fieldIndex + 1; // Update field row_position
                field.column_position = 1; // Default column position
            });
        });

        // Write JSON output to a file
        const outputFilePath = 'output.json'; // Replace with your desired output file path
        fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2), 'utf8');
        console.log(`JSON file has been created: ${outputFilePath}`);
    })
    .on('error', (error) => {
        console.error(`Error reading CSV file: ${error.message}`);
    });
