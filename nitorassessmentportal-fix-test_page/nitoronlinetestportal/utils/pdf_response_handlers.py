from fpdf import FPDF
import io
from django.http import HttpResponse

class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            self.set_font("Arial", "B", size=12)
            self.cell(0, 10, 'User Test Report', 0, 1, 'C')
            self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'B', size=10)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def add_section_title(self, title):
        self.set_font("Arial", "B", size=12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)

    def add_key_value(self, key, value):
        self.set_font('Arial', '', size=12)
        if value:
            line = f"{key} - {value}"
        else:
            line = f"{key} -"
        self.multi_cell(0, 10, line)
        self.ln(1)

    def add_questions(self, language, question_details):
        if isinstance(question_details, int):
            return
        self.add_section_title(f"{language} Secion: Question/Answer Details")
        for index, question_detail in enumerate(question_details):
            self.add_key_value(f"Question {index+1}", question_detail["question_details"]["name"])
            correct_answer = question_detail["correct_value"]
            candidate_answer = question_detail["candidate_answers"]
            for i, option_key in enumerate(['option1', 'option2', 'option3', 'option4'], 1):
                option_value = question_detail.get(option_key, '')
                if correct_answer == candidate_answer == option_value:
                    line = f"{i}. - {option_value} - You chose right Option"
                else:
                    line = f"{i}. - {option_value}"
                    if option_value == correct_answer:
                        line = f"{i}. - {option_value} - Correct Answer"
                    elif option_value == candidate_answer:
                        line = f"{i}. - {option_value} - Candidate Answer"
                self.multi_cell(0, 10, line)


def generate_pdf(user_test_details):
    test_details = {"Test Name":user_test_details['test_name']}

    candidate_info = {"Name": user_test_details['name'],
                      "Email": user_test_details['email'],
                      "Submission Date": user_test_details['end_date'].strftime('%d/%m/%Y') 
                      }
    questions = user_test_details['generated_question']
    
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Add Test Details section
    pdf.add_section_title("Test Details:")
    for key, value in test_details.items():
        pdf.add_key_value(key, value)

    # # Add Candidate Info section
    pdf.add_section_title("Candidate Info:")
    for key, value in candidate_info.items():
        pdf.add_key_value(key, value)

    # # Add Score Distribution
    pdf.add_section_title("Score distribution:")
    pdf.set_font('Arial', '', size=12)
    pdf.multi_cell(0, 10, f"{user_test_details['score']}/{user_test_details['generated_question']['weightage']}")
    pdf.ln(2)

    # Add Questions and Answers
    for language, question_details in questions.items():
        pdf.add_questions(language, question_details)
    pdf_output = io.BytesIO()
    bytes = pdf.output(dest='S').encode('latin1')
    pdf_output.write(bytes)
    pdf_output.seek(0)
    # Save PDF to BytesIO object
    return pdf_output