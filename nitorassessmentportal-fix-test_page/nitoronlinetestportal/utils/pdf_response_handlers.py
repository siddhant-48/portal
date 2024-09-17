from fpdf import FPDF
import io
import matplotlib
matplotlib.use('Agg')  # Use the Agg backend for non-interactive plotting
import matplotlib.pyplot as plt
import numpy as np


class PDF(FPDF):
    def add_section_title(self, title):
        self.set_font("Aptos", "B", size=12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)

    def add_key_value(self, key, value):
        self.set_font('Aptos', '', size=12)
        if value:
            line = f"{key} - {value}"
        else:
            line = f"{key} -"
        self.multi_cell(0, 10, line)
        self.ln(1)

    def add_questions(self, language, question_details):
        if isinstance(question_details, int):
            return
        self.add_section_title(f"{language} Section: Question/Answer Details")
        for index, question_detail in enumerate(question_details):
            self.add_key_value(f"Question {index+1}", question_detail["question_details"]["name"])
            correct_answer = question_detail["correct_value"]
            candidate_answer = question_detail["candidate_answers"]
            for i, option_key in enumerate(['option1', 'option2', 'option3', 'option4'], 1):
                option_value = question_detail.get(option_key, '')
                
                if correct_answer == candidate_answer == option_value:
                    line = f"{i}. - {option_value} - "
                    
                    # Calculate the width of the option_value text
                    option_width = self.get_string_width(line)
                    # Print the option_value line
                    self.cell(option_width, 10, line, ln=0)
                    # Set color for "You chose right Option" and then reset
                    self.set_text_color(0, 0, 255)  # Blue
                    # Use multi-cell to handle the text properly
                    self.multi_cell(0, 10, "You chose right Option")
                    self.set_text_color(0, 0, 0)  # Reset to black
                    
                else:
                    line = f"{i}. - {option_value} - "                    
                    if option_value == correct_answer:
                        # Set color for "Correct Answer" and then reset
                        line = f"{i}. - {option_value} - "                    
                        # Calculate the width of the option_value text
                        option_width = self.get_string_width(line)
                        # Print the option_value line
                        self.cell(option_width, 10, line, ln=0)
                        self.set_text_color(0, 128, 0)  # Green
                        # Use multi-cell to handle the text properly
                        self.multi_cell(0, 10, "Correct Answer")
                        self.set_text_color(0, 0, 0)  # Reset to black
                        
                    elif option_value == candidate_answer:
                        line = f"{i}. - {option_value} - "                    
                        # Calculate the width of the option_value text
                        option_width = self.get_string_width(line)
                        # Print the option_value line
                        self.cell(option_width, 10, line, ln=0)
                        # Set color for "Candidate Answer" and then reset
                        self.set_text_color(255, 0, 0)  # Red
                        self.multi_cell(0, 10, "Candidate Answer")
                        self.set_text_color(0, 0, 0)  # Reset to black
                    else:
                        line = f"{i}. - {option_value}"                    
                        self.cell(30, 10, line, ln=1)


def generate_polar_plot(angle_value):
    angle_value = int(angle_value)
    colors = ["#99CC66", "#66B2FF", "#FFCC66", "#FF6666"]
    values = [100, 76, 51, 26, 0]  # Reversed order of values
    fig = plt.figure(figsize=(15, 10))  # Adjusted figure size for half meter
    ax = fig.add_subplot(projection="polar")

    # Plot the bars on the polar plot
    ax.bar([0, 0.8, 1.6, 2.4], width=0.8, height=1.0, bottom=2,
           linewidth=3, edgecolor="white", color=colors, align="edge")
    
    # Annotate all values including the last one (0)
    for loc, val in zip([0, 0.8, 1.6, 2.4, 3.2], values):
        plt.annotate(val, xy=(loc, 2.5), ha="center", fontsize=20)

    # Calculate the angle for the arrow based on angle_value for a half meter
    angle_radians = ((100 - angle_value) / 100) * np.pi  # Adjusted for reversed values

    plt.annotate("", xytext=(0, 0), xy=(angle_radians, 2.0),
                 arrowprops=dict(arrowstyle="wedge, tail_width=0.5", color="black", shrinkA=6),
                 bbox=dict(boxstyle="circle", facecolor="black", linewidth=2.0),
                 fontsize=45, color="white", ha="center")

    # Determine the label based on angle_value
    if 0 <= angle_value <= 25:
        level = "Beginner"
        level_color = "#FF6666"
    elif 26 <= angle_value <= 50:
        level = "Intermediate"
        level_color = "#FFCC66"
    elif 51 <= angle_value <= 75:
        level = "Experienced"
        level_color = "#66CCFF"
    elif 76 <= angle_value <= 100:
        level = "Proficient"
        level_color = "#99CC66"
    else:
        level = "Unknown"  # Fallback option if the angle_value is out of expected range
        level_color = "#FF6666"

    # Add the title with the determined label and percentage
    plt.title(f"{level} ({angle_value}%)", loc="center", pad=20, fontsize=65, fontweight="bold", color=level_color)
    ax.set_axis_off()
    plt.savefig("utils/chart.png", format="png")
    plt.close()

def generate_linear_gauge_plot(percentage):
    fig, ax = plt.subplots(figsize=(10, 0.4))
    # Determine the color based on the percentage
    if 0 <= percentage <= 25:
        color = '#FF6666'
    elif 26 <= percentage <= 50:
        color = '#FFCC66'
    elif 51 <= percentage <= 75:
        color = '#66CCFF'
    elif 76 <= percentage <= 100:
        color = '#99CC66'
    else:
        color = '#FFCC66'  # Default color if percentage is out of bounds

    ax.barh(0, 100, height=0.5, color='#DDDDDD')  # Background bar
    ax.barh(0, percentage, height=0.5, color=color)  # Foreground bar

    ax.set_xlim(0, 100)
    ax.set_yticks([])
    ax.set_xticks([])
    ax.text(percentage + 1, 0, f'{percentage:.1f}%', va='center', ha='left', fontsize=20, color='black')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_visible(False)

    plt.savefig('utils/linear_gauge.png', bbox_inches='tight', dpi=100)
    plt.close()

def add_candidate_details_to_pdf(pdf, data):
    pdf.set_font("Aptos", size=12)
    pdf.ln(10)
    # Candidate ID: Normal font
    pdf.cell(50, 10, txt="Candidate ID:", ln=0)
    
    # Candidate ID value: Bold font
    pdf.set_font("Aptos", style='B', size=12)
    pdf.cell(50, 10, txt=f"{data['id']}", ln=True)
    
    # Reset font to normal
    pdf.set_font("Aptos", size=12)
    pdf.cell(50, 10, txt="Candidate Name:", ln=0)
    
    # Candidate Name value: Bold font
    pdf.set_font("Aptos", style='B', size=12)
    pdf.cell(50, 10, txt=f"{data['name']}", ln=True)
    
    # Reset font to normal
    pdf.set_font("Aptos", size=12)
    pdf.cell(50, 10, txt="Date:", ln=0)
    
    # Date value: Bold font
    pdf.set_font("Aptos", style='B', size=12)
    pdf.cell(50, 10, txt=f"{data['created_at']}", ln=True)
    
    # Reset font to normal
    pdf.set_font("Aptos", size=12)
    pdf.cell(50, 10, txt="Assessment Name:", ln=0)
    
    # Assessment Name value: Bold font
    pdf.set_font("Aptos", style='B', size=12)
    pdf.cell(50, 10, txt=f"{data['test_name']}", ln=True)
    
    # Reset font to normal
    pdf.set_font("Aptos", size=12)
    pdf.cell(50, 10, txt="Client Name:", ln=0)
    
    # Client Name value: Bold font
    pdf.set_font("Aptos", style='B', size=12)
    pdf.cell(50, 10, txt=f"{data['email']}", ln=True)

    image_path = 'utils/user.png'
    pdf.image(image_path, x=130, y=25, w=50)

def add_images_and_analysis_to_pdf(pdf, data):
    pdf.ln(10)

    pdf.set_font("Aptos", "B", size=12)
    pdf.cell(0, 10, 'SCORE ANALYSIS', 0, 1, 'L')
    pdf.line(5, pdf.get_y(), 200, pdf.get_y())

    pdf.set_font('Aptos', '', size=12)
    pdf.multi_cell(0, 10, f"Score: {data['score']}/{data['generated_question']['weightage']}")
    # pdf.multi_cell(0, 10, f"Time Taken: {data['generated_question']['duration']/60} Min / {data['generated_question']['duration']/60} Min")

    pdf.image('utils/chart.png', x=40, y=110, w=120)
    pdf.image('utils/categories_plot.png', x=150, y=105, w=50)

    pdf.ln(48)
    score = data['score']
    weightage = data['generated_question']['weightage']
    percentage = (score / weightage) * 100
    pdf.cell(200, 10, txt=f"{data['name']} scored {int(percentage)}% and completed assessment in 100% of the allotted time", ln=True, align='C')

    pdf.ln(10)

    pdf.set_font("Aptos", "B", size=12)
    pdf.cell(0, 10, 'SECTION SCORE ANALYSIS', 0, 1, 'L')
    pdf.line(5, pdf.get_y(), 200, pdf.get_y())

    pdf.image('utils/horizone.png', x=10, y=190, w=190)

    pdf.ln(20)

    pdf.set_font("Aptos", "B", size=12)
    pdf.cell(0, 10, 'Section Percentage', 0, 1, 'L')
    lang_value = list(data['generated_question'].keys())
    pdf.multi_cell(0, 10, f"{lang_value[0]}")

    score = data['score']
    weightage = data['generated_question']['weightage']
    percentage = (score / weightage) * 100

    generate_linear_gauge_plot(percentage)
    pdf.image('utils/linear_gauge.png', x=25, y=220, w=100)
    pdf.ln(10)

    pdf.line(5, pdf.get_y(), 200, pdf.get_y())

    pdf.ln(10)

def generate_pdf(data):
    questions = data['generated_question']
    pdf = PDF()
    pdf.add_page()

    pdf.add_font('Aptos', '', 'utils/Aptos-Regular.ttf', uni=True)
    pdf.add_font('Aptos', 'B', 'utils/Aptos-Bold.ttf', uni=True)
    
    pdf.image('utils/nitor.png', x=6, y=5, w=28)

    pdf.set_font("Aptos", "B", size=12)
    pdf.cell(0, 10, 'Assessment Report', 0, 1, 'R')

    pdf.line(5, pdf.get_y(), 200, pdf.get_y())

    score = data['score']
    weightage = data['generated_question']['weightage']
    percentage = (score / weightage) * 100

    generate_polar_plot(percentage)
    add_candidate_details_to_pdf(pdf, data)
    add_images_and_analysis_to_pdf(pdf, data)

    # Adding questions and answers
    for language, question_details in questions.items():
        pdf.add_questions(language, question_details)
    
    pdf_output = io.BytesIO()
    bytes = pdf.output(dest='S').encode('latin1')
    pdf_output.write(bytes)
    pdf_output.seek(0)
    # Save PDF to BytesIO object
    return pdf_output