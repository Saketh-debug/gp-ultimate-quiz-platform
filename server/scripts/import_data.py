import re
import psycopg2

def load_data():
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="postgres",
        password="password",
        dbname="contest_db"
    )
    cur = conn.cursor()

    try:
        with open('../sudhamsh_updated.sql', 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Find questions
        in_questions = False
        in_testcases = False
        
        for line in lines:
            if line.startswith('COPY public.questions '):
                in_questions = True
                continue
            if line.startswith('COPY public.test_cases '):
                in_testcases = True
                continue
                
            if in_questions:
                if line.startswith('\\.'):
                    in_questions = False
                    continue
                parts = line.strip('\n').split('\t')
                # id, title, description, avg_time, round, base_points, sequence_order, time_limit, sample_input
                # replace \N with None
                parts = [None if p == '\\N' else p for p in parts]
                # sample_input is the last one
                if len(parts) >= 9:
                    cur.execute("""
                        INSERT INTO questions (id, title, description, avg_time, round, base_points, sequence_order, time_limit, sample_input)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING;
                    """, (parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8][:1000] if parts[8] else None))
                    
            if in_testcases:
                if line.startswith('\\.'):
                    in_testcases = False
                    continue
                parts = line.strip('\n').split('\t')
                # id, question_id, input_data, expected_output, is_hidden, points
                parts = [None if p == '\\N' else p for p in parts]
                if len(parts) >= 6:
                    cur.execute("""
                        INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, points)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO NOTHING;
                    """, (parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]))

        conn.commit()
        print("Successfully imported questions and test cases")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    load_data()
