--
-- PostgreSQL database dump
--

\restrict Wrle2bqzcyudF2cb3GYFVKcgOTVewd4aEi6k1JHXvEJ2YwSXcaZXjAGf8jeE2Cl

-- Dumped from database version 13.23 (Debian 13.23-1.pgdg13+1)
-- Dumped by pg_dump version 13.23 (Debian 13.23-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    token character varying(255)
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attempts (
    id integer NOT NULL,
    user_id integer,
    question_id integer,
    code text,
    status character varying(50),
    "timestamp" timestamp without time zone DEFAULT now()
);


--
-- Name: attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attempts_id_seq OWNED BY public.attempts.id;


--
-- Name: cascade_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cascade_sessions (
    id integer NOT NULL,
    user_id integer,
    join_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    current_streak integer DEFAULT 0,
    max_streak integer DEFAULT 0,
    highest_forward_index integer DEFAULT 0,
    is_review_mode boolean DEFAULT false,
    current_viewing_index integer DEFAULT 0,
    streak_bonus_applied boolean DEFAULT false
);


--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cascade_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cascade_sessions_id_seq OWNED BY public.cascade_sessions.id;


--
-- Name: cascade_user_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cascade_user_questions (
    user_id integer NOT NULL,
    question_id integer NOT NULL,
    sequence_order integer NOT NULL,
    status character varying(20) DEFAULT NULL::character varying,
    base_points integer DEFAULT 0,
    is_streak_eligible boolean DEFAULT true,
    score_awarded integer DEFAULT 0
);


--
-- Name: dsa_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dsa_sessions (
    id integer NOT NULL,
    user_id integer,
    join_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    total_score integer DEFAULT 0
);


--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dsa_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dsa_sessions_id_seq OWNED BY public.dsa_sessions.id;


--
-- Name: dsa_user_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dsa_user_questions (
    user_id integer NOT NULL,
    question_id integer NOT NULL,
    sequence_order integer NOT NULL,
    status character varying(20) DEFAULT NULL::character varying,
    base_points integer DEFAULT 0,
    accepted_at timestamp without time zone,
    passed_count integer DEFAULT 0,
    score_awarded integer DEFAULT 0
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    avg_time integer DEFAULT 180,
    round character varying(50) DEFAULT 'rapidfire'::character varying,
    base_points integer DEFAULT 10,
    sequence_order integer DEFAULT 0,
    time_limit real
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: round_control; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.round_control (
    round_name character varying(50) NOT NULL,
    start_time timestamp with time zone,
    is_active boolean DEFAULT false
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    problem_id character varying(50),
    source_code text NOT NULL,
    language_id integer NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    stdout text,
    stderr text,
    execution_time character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_cases (
    id integer NOT NULL,
    problem_id character varying(50) NOT NULL,
    input text NOT NULL,
    expected_output text NOT NULL,
    is_hidden boolean DEFAULT true
);


--
-- Name: test_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.test_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: test_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.test_cases_id_seq OWNED BY public.test_cases.id;


--
-- Name: user_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_questions (
    id integer NOT NULL,
    user_id integer,
    question_id integer,
    status character varying(50) DEFAULT 'unsolved'::character varying,
    start_time timestamp with time zone,
    sequence_order integer DEFAULT 0,
    score_awarded integer DEFAULT 0
);


--
-- Name: user_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_questions_id_seq OWNED BY public.user_questions.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer,
    socket_id character varying(255),
    join_time timestamp with time zone,
    end_time timestamp with time zone
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    team_name character varying(255),
    rapidfire_score integer DEFAULT 0,
    cascade_score integer DEFAULT 0,
    dsa_score integer DEFAULT 0
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts ALTER COLUMN id SET DEFAULT nextval('public.attempts_id_seq'::regclass);


--
-- Name: cascade_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_sessions ALTER COLUMN id SET DEFAULT nextval('public.cascade_sessions_id_seq'::regclass);


--
-- Name: dsa_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_sessions ALTER COLUMN id SET DEFAULT nextval('public.dsa_sessions_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: test_cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases ALTER COLUMN id SET DEFAULT nextval('public.test_cases_id_seq'::regclass);


--
-- Name: user_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions ALTER COLUMN id SET DEFAULT nextval('public.user_questions_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, username, password, token) FROM stdin;
1	admin	admin123	ADMIN_TOKEN_SECRET
\.


--
-- Data for Name: attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attempts (id, user_id, question_id, code, status, "timestamp") FROM stdin;
\.


--
-- Data for Name: cascade_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cascade_sessions (id, user_id, join_time, end_time, current_streak, max_streak, highest_forward_index, is_review_mode, current_viewing_index, streak_bonus_applied) FROM stdin;
\.


--
-- Data for Name: cascade_user_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cascade_user_questions (user_id, question_id, sequence_order, status, base_points, is_streak_eligible, score_awarded) FROM stdin;
\.


--
-- Data for Name: dsa_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dsa_sessions (id, user_id, join_time, end_time, total_score) FROM stdin;
1	3	2026-03-01 13:51:32.659+00	2026-03-01 15:51:32.659+00	550
\.


--
-- Data for Name: dsa_user_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dsa_user_questions (user_id, question_id, sequence_order, status, base_points, accepted_at, passed_count, score_awarded) FROM stdin;
3	41	0	ACCEPTED	50	2026-03-01 19:21:53.647	3	50
3	42	1	PARTIAL	100	\N	2	100
3	43	2	PARTIAL	100	\N	2	100
3	44	3	ACCEPTED	150	2026-03-01 19:22:55.535	3	150
3	45	4	ACCEPTED	150	2026-03-01 19:23:04.735	3	150
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (id, title, description, avg_time, round, base_points, sequence_order, time_limit) FROM stdin;
16	Celsius to Fahrenheit	Convert Celsius to Fahrenheit. Formula: (C * 9/5) + 32. Print integer part.	180	rapidfire	10	0	\N
17	Power of Two	Check if a number is a power of two. Print 'Yes' or 'No'.	180	rapidfire	10	0	\N
18	Multiple of 5	Check if a number is a multiple of 5. Print 'Yes' or 'No'.	180	rapidfire	10	0	\N
19	Area of Rectangle	Given length and width, print area.	180	rapidfire	10	0	\N
20	Swap Two Numbers	Given two numbers, print them in swapped order separated by a space.	180	rapidfire	10	0	\N
21	Cube of Number	Print the cube of a given number.	180	rapidfire	10	0	\N
22	Uppercase Conversion	Convert a lowercase character to uppercase.	180	rapidfire	10	0	\N
23	Check Positive Negative	Check if a number is Positive, Negative or Zero.	180	rapidfire	10	0	\N
24	Print ASCII Value	Print the ASCII value of a given character.	180	rapidfire	10	0	\N
25	Sum of First N Numbers	Print sum of first N natural numbers.	180	rapidfire	10	0	\N
26	Absolute Value	Print the absolute value of an integer.	180	rapidfire	10	0	\N
27	Check Alphabet	Check if a character is an alphabet. Print 'Yes' or 'No'.	180	rapidfire	10	0	\N
28	Divisible by 3 and 5	Check if a number is divisible by both 3 and 5. Print 'Yes' or 'No'.	180	rapidfire	10	0	\N
29	Last Digit	Print the last digit of a number.	180	rapidfire	10	0	\N
30	Check Voting Age	Given age, print 'Eligible' if age >= 18, else 'Not Eligible'.	180	rapidfire	10	0	\N
2	Check Even or Odd	Write a program that takes an integer as input and prints 'Even' if it is even, and 'Odd' if it is odd.	180	cascade	10	2	\N
3	Factorial of a Number	Write a program to find the factorial of a given number N.	180	cascade	10	3	\N
4	Reverse a String	Write a program that takes a string as input and prints its reverse.	180	cascade	10	4	\N
5	Find Maximum of Three	Write a program that takes three integers as input and prints the largest one.	180	cascade	10	5	\N
6	Check Prime Number	Write a program to check if a given number N is prime. Print 'Yes' if prime, 'No' otherwise.	180	cascade	10	6	\N
7	Fibonacci Sequence	Write a program to print the Nth number in the Fibonacci sequence (0-indexed). F(0)=0, F(1)=1.	180	cascade	10	7	\N
8	Count Vowels	Write a program to count the number of vowels (a, e, i, o, u) in a given string (case insensitive).	180	cascade	10	8	\N
9	Palindrome Check	Write a program to check if a given string is a palindrome. Print 'Yes' or 'No'.	180	cascade	10	9	\N
10	Sum of Array Arguments	Given N, followed by N integers, print their sum.	180	cascade	10	10	\N
11	Find Minimum Element	Given N, followed by N integers. Print the minimum element.	180	cascade	10	11	\N
12	Square Check	Check if a given number is a perfect square. Print 'Yes' or 'No'.	180	cascade	10	12	\N
13	Simple Interest	Calculate Simple Interest given multiple lines: Principal, Rate, Time. Print floor value.	180	cascade	10	13	\N
14	Print 1 to N	Print numbers from 1 to N separated by space.	180	cascade	10	14	\N
15	Leap Year	Check if a year is a leap year. Print 'Yes' or 'No'.	180	cascade	10	15	\N
1	Sum of Two Numbers	<p>Write a program that takes two integers as input and prints their sum.</p>\n\n<p><strong class="example">Example 1:</strong></p>\n<pre>\n<strong>Input:</strong> 5 7\n<strong>Output:</strong> 12\n<strong>Explanation:</strong> 5 + 7 = 12\n</pre>\n\n<p><strong class="example">Example 2:</strong></p>\n<pre>\n<strong>Input:</strong> -3 10\n<strong>Output:</strong> 7\n<strong>Explanation:</strong> -3 + 10 = 7\n</pre>\n\n<p><strong>Constraints:</strong></p>\n<ul>\n<li><code>-10^4 &lt;= A, B &lt;= 10^4</code></li>\n<li>The input will be provided as two space-separated integers.</li>\n</ul>	180	cascade	10	1	\N
41	Range Pair Sum	## Range Pair Sum\n\nYou are given an integer **N**.\n\nCount the number of pairs **(i, j)** such that:\n- 1 ≤ i < j ≤ N\n- (i + j) is divisible by 3\n\nPrint the total count.\n\n---\n\n### Input Format\n\nThe first line contains **t** — the number of test cases.\nEach of the next **t** lines contains a single integer **N**.\n\n### Output Format\n\nFor each test case, print the answer on a new line.\n\n---\n\n### Example\n\n**Input:**\n```\n1\n5\n```\n\n**Output:**\n```\n4\n```\n\n**Explanation:**\nValid pairs: (1,2)→3✔, (1,5)→6✔, (2,4)→6✔, (4,5)→9✔ → Total = 4\n\n---\n\n### Constraints\n\nSee subtask details in this question's scoring tier.\n\n> **Subtask 1 (50 pts):** 1 ≤ N ≤ 100. Brute force O(N²) works.	180	dsa	50	0	2
42	Range Pair Sum	## Range Pair Sum\n\nYou are given an integer **N**.\n\nCount the number of pairs **(i, j)** such that:\n- 1 ≤ i < j ≤ N\n- (i + j) is divisible by 3\n\nPrint the total count.\n\n---\n\n### Input Format\n\nThe first line contains **t** — the number of test cases.\nEach of the next **t** lines contains a single integer **N**.\n\n### Output Format\n\nFor each test case, print the answer on a new line.\n\n---\n\n### Example\n\n**Input:**\n```\n1\n5\n```\n\n**Output:**\n```\n4\n```\n\n**Explanation:**\nValid pairs: (1,2)→3✔, (1,5)→6✔, (2,4)→6✔, (4,5)→9✔ → Total = 4\n\n---\n\n### Constraints\n\nSee subtask details in this question's scoring tier.\n\n> **Subtask 2 (100 pts):** 2 hidden TCs. TC1 (N≤100): brute force O(N²) earns 30 pts. TC2 (N≤10⁵): O(N) or better earns 100 pts total.	180	dsa	100	1	2
43	Range Pair Sum	## Range Pair Sum\n\nYou are given an integer **N**.\n\nCount the number of pairs **(i, j)** such that:\n- 1 ≤ i < j ≤ N\n- (i + j) is divisible by 3\n\nPrint the total count.\n\n---\n\n### Input Format\n\nThe first line contains **t** — the number of test cases.\nEach of the next **t** lines contains a single integer **N**.\n\n### Output Format\n\nFor each test case, print the answer on a new line.\n\n---\n\n### Example\n\n**Input:**\n```\n1\n5\n```\n\n**Output:**\n```\n4\n```\n\n**Explanation:**\nValid pairs: (1,2)→3✔, (1,5)→6✔, (2,4)→6✔, (4,5)→9✔ → Total = 4\n\n---\n\n### Constraints\n\nSee subtask details in this question's scoring tier.\n\n> **Subtask 3 (100 pts):** 2 hidden TCs. TC1 (N≤100): brute force O(N²) earns 30 pts. TC2 (N≤10⁵): O(N) or better earns 100 pts total.	180	dsa	100	2	2
44	Range Pair Sum	## Range Pair Sum\n\nYou are given an integer **N**.\n\nCount the number of pairs **(i, j)** such that:\n- 1 ≤ i < j ≤ N\n- (i + j) is divisible by 3\n\nPrint the total count.\n\n---\n\n### Input Format\n\nThe first line contains **t** — the number of test cases.\nEach of the next **t** lines contains a single integer **N**.\n\n### Output Format\n\nFor each test case, print the answer on a new line.\n\n---\n\n### Example\n\n**Input:**\n```\n1\n5\n```\n\n**Output:**\n```\n4\n```\n\n**Explanation:**\nValid pairs: (1,2)→3✔, (1,5)→6✔, (2,4)→6✔, (4,5)→9✔ → Total = 4\n\n---\n\n### Constraints\n\nSee subtask details in this question's scoring tier.\n\n> **Subtask 4 (150 pts):** 1 ≤ N ≤ 10⁹. Only O(1) mathematical formula will pass.	180	dsa	150	3	2
45	Range Pair Sum	## Range Pair Sum\n\nYou are given an integer **N**.\n\nCount the number of pairs **(i, j)** such that:\n- 1 ≤ i < j ≤ N\n- (i + j) is divisible by 3\n\nPrint the total count.\n\n---\n\n### Input Format\n\nThe first line contains **t** — the number of test cases.\nEach of the next **t** lines contains a single integer **N**.\n\n### Output Format\n\nFor each test case, print the answer on a new line.\n\n---\n\n### Example\n\n**Input:**\n```\n1\n5\n```\n\n**Output:**\n```\n4\n```\n\n**Explanation:**\nValid pairs: (1,2)→3✔, (1,5)→6✔, (2,4)→6✔, (4,5)→9✔ → Total = 4\n\n---\n\n### Constraints\n\nSee subtask details in this question's scoring tier.\n\n> **Subtask 5 (150 pts):** 1 ≤ N ≤ 10⁹. Only O(1) mathematical formula will pass.	180	dsa	150	4	2
\.


--
-- Data for Name: round_control; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.round_control (round_name, start_time, is_active) FROM stdin;
rapidfire	2026-02-25 17:01:22.297+00	f
cascade	2026-03-01 10:55:33.449+00	f
dsa	2026-03-01 13:51:25.825+00	t
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, user_id, problem_id, source_code, language_id, status, stdout, stderr, execution_time, created_at) FROM stdin;
1	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long N;\n    cin >> N;\n\n    long long count = 0;\n\n    for (long long i = 1; i <= N; i++) {\n        for (long long j = i + 1; j <= N; j++) {\n            if ((i + j) % 3 == 0) {\n                count++;\n            }\n        }\n    }\n\n    cout << count << endl;\n\n    return 0;\n}	54	ACCEPTED	0\n		0.007	2026-03-01 13:15:21.761043
6	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-03-01 13:19:59.52538
2	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}	54	ACCEPTED	4\n		0.008	2026-03-01 13:15:45.369474
3	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-03-01 13:15:47.530978
4	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-03-01 13:18:32.00686
7	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-03-01 13:20:05.972948
5	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}	54	PARTIAL	166500\n66663334\n	Failed on Test Case 2 (status: Time Limit Exceeded)	0.003	2026-03-01 13:19:09.2053
8	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-03-01 13:20:14.83026
16	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:43:54.09182
9	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}	54	PARTIAL		Failed on Test Case 3 (status: Time Limit Exceeded)	0.007	2026-03-01 13:21:02.943502
14	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	PARTIAL	166500\n66663334\n	Failed on Test Case 2 (status: Time Limit Exceeded)	0.007	2026-03-01 13:31:48.538873
10	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}	54	ACCEPTED			0.008	2026-03-01 13:22:04.469251
11	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-03-01 13:29:03.895133
12	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:29:08.895726
15	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	PARTIAL		Failed on Test Case 3 (status: Time Limit Exceeded)	0.007	2026-03-01 13:32:05.291048
13	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:31:34.753375
18	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:44:17.969696
17	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	PARTIAL	166500\n66663334\n	Failed on Test Case 2 (status: Time Limit Exceeded)	0.006	2026-03-01 13:43:59.74147
19	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:44:42.539981
20	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-03-01 13:45:15.511861
34	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.008	2026-03-01 13:53:03.25586
21	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:45:20.27995
30	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.009	2026-03-01 13:52:20.233079
22	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-03-01 13:47:18.491527
28	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.008	2026-03-01 13:51:52.190018
23	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-03-01 13:47:30.617168
24	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.008	2026-03-01 13:47:33.891909
25	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-03-01 13:47:40.729422
29	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	PARTIAL	166500\n66663334\n	Failed on Test Case 2 (status: Time Limit Exceeded)	0.008	2026-03-01 13:52:01.670998
26	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long count = 0;\n\n        for(long long i = 1; i <= N; i++) {\n            for(long long j = i + 1; j <= N; j++) {\n                if((i + j) % 3 == 0) {\n                    count++;\n                }\n            }\n        }\n\n        cout << count << endl;\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:47:44.625728
27	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.008	2026-03-01 13:47:52.652215
32	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	PARTIAL		Failed on Test Case 3 (status: Time Limit Exceeded)	0.008	2026-03-01 13:52:38.914795
31	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = 0, c1 = 0, c2 = 0;\n\n        // O(N) loop\n        for(long long i = 1; i <= N; i++) {\n            if(i % 3 == 0)\n                c0++;\n            else if(i % 3 == 1)\n                c1++;\n            else\n                c2++;\n        }\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-03-01 13:52:26.920176
33	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int t;\n    cin >> t;\n\n    while(t--) {\n        long long N;\n        cin >> N;\n\n        long long c0 = N / 3;\n        long long c1 = (N + 2) / 3;\n        long long c2 = (N + 1) / 3;\n\n        long long pairs_from_c0 = (c0 * (c0 - 1)) / 2;\n        long long pairs_from_c1_c2 = c1 * c2;\n\n        long long result = pairs_from_c0 + pairs_from_c1_c2;\n\n        cout << result << "\\n";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.008	2026-03-01 13:52:54.085621
\.


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_cases (id, problem_id, input, expected_output, is_hidden) FROM stdin;
14	1	3\n5	8	t
15	1	10\n20	30	t
16	1	-5\n5	0	t
17	2	2	Even	t
18	2	3	Odd	t
19	2	0	Even	t
20	3	5	120	t
21	3	3	6	t
22	3	0	1	t
23	4	hello	olleh	t
24	4	world	dlrow	t
25	4	12345	54321	t
26	5	1\n5\n3	5	t
27	5	10\n2\n8	10	t
28	5	-1\n-5\n-3	-1	t
29	6	7	Yes	t
30	6	10	No	t
31	6	1	No	t
32	7	0	0	t
33	7	5	5	t
34	7	10	55	t
35	8	hello	2	t
36	8	Apple	2	t
37	8	sky	0	t
38	9	madam	Yes	t
39	9	hello	No	t
40	9	racecar	Yes	t
41	10	3\n1\n2\n3	6	t
42	10	2\n10\n20	30	t
43	10	1\n5	5	t
44	11	3\n5\n1\n9	1	t
45	11	2\n10\n20	10	t
46	11	1\n5	5	t
47	12	4	Yes	t
48	12	5	No	t
49	12	16	Yes	t
50	13	1000\n5\n2	100	t
51	13	5000\n10\n1	500	t
52	13	200\n2\n2	8	t
53	14	5	1 2 3 4 5	t
54	14	1	1	t
55	14	3	1 2 3	t
56	15	2020	Yes	t
57	15	2021	No	t
58	15	2000	Yes	t
59	16	0	32	t
60	16	100	212	t
61	16	-40	-40	t
62	17	8	Yes	t
63	17	6	No	t
64	17	1	Yes	t
65	18	10	Yes	t
66	18	11	No	t
67	18	55	Yes	t
68	19	5\n4	20	t
69	19	10\n10	100	t
70	19	2\n3	6	t
71	20	5\n10	10 5	t
72	20	1\n2	2 1	t
73	20	-5\n5	5 -5	t
74	21	3	27	t
75	21	2	8	t
76	21	1	1	t
77	22	a	A	t
78	22	z	Z	t
79	22	m	M	t
80	23	5	Positive	t
81	23	-2	Negative	t
82	23	0	Zero	t
83	24	A	65	t
84	24	a	97	t
85	24	0	48	t
86	25	5	15	t
87	25	3	6	t
88	25	10	55	t
89	26	-5	5	t
90	26	10	10	t
91	26	0	0	t
92	27	a	Yes	t
93	27	1	No	t
94	27	$	No	t
95	28	15	Yes	t
96	28	10	No	t
97	28	9	No	t
98	29	123	3	t
99	29	10	0	t
100	29	5	5	t
101	30	18	Eligible	t
102	30	17	Not Eligible	t
103	30	25	Eligible	t
124	41	4\n5\n10\n20\n30	4\n15\n64\n145\n	t
125	41	4\n40\n60\n80\n90	260\n590\n1054\n1335\n	t
126	41	4\n50\n75\n95\n100	409\n925\n1489\n1650\n	t
127	42	4\n5\n10\n50\n100	4\n15\n409\n1650\n	t
128	42	4\n1000\n20000\n99999\n100000	166500\n66663334\n1666616667\n1666650000\n	t
129	43	4\n5\n10\n50\n100	4\n15\n409\n1650\n	t
130	43	4\n1000\n20000\n99999\n100000	166500\n66663334\n1666616667\n1666650000\n	t
131	44	4\n5\n10\n50\n100	4\n15\n409\n1650\n	t
132	44	4\n1000\n20000\n99999\n100000	166500\n66663334\n1666616667\n1666650000\n	t
133	44	4\n10000000\n100000000\n1000000000\n999999937	16666665000000\n1666666650000000\n166666666500000000\n166666645500000672\n	t
134	45	4\n5\n10\n50\n100	4\n15\n409\n1650\n	t
135	45	4\n1000\n20000\n99999\n100000	166500\n66663334\n1666616667\n1666650000\n	t
136	45	4\n10000000\n100000000\n1000000000\n999999937	16666665000000\n1666666650000000\n166666666500000000\n166666645500000672\n	t
\.


--
-- Data for Name: user_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_questions (id, user_id, question_id, status, start_time, sequence_order, score_awarded) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, socket_id, join_time, end_time) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, token, team_name, rapidfire_score, cascade_score, dsa_score) FROM stdin;
1	demo	DEMO123	RapidFire Squad	0	0	0
2	tej	HAHA123	Pixel Pioneers	0	0	0
4	sudhamsh	SUDHA123	teamsudhamsh	0	0	0
3	tigercharan	TEJ123	Venkata Broker	0	0	550
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attempts_id_seq', 1, false);


--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cascade_sessions_id_seq', 1, false);


--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dsa_sessions_id_seq', 1, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_id_seq', 45, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.submissions_id_seq', 34, true);


--
-- Name: test_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.test_cases_id_seq', 136, true);


--
-- Name: user_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_questions_id_seq', 1, false);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: attempts attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);


--
-- Name: cascade_sessions cascade_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_sessions
    ADD CONSTRAINT cascade_sessions_pkey PRIMARY KEY (id);


--
-- Name: cascade_user_questions cascade_user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: dsa_sessions dsa_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_sessions
    ADD CONSTRAINT dsa_sessions_pkey PRIMARY KEY (id);


--
-- Name: dsa_user_questions dsa_user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: round_control round_control_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.round_control
    ADD CONSTRAINT round_control_pkey PRIMARY KEY (round_name);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: user_questions user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_token_key UNIQUE (token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: attempts attempts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: attempts attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cascade_sessions cascade_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_sessions
    ADD CONSTRAINT cascade_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cascade_user_questions cascade_user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: cascade_user_questions cascade_user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsa_sessions dsa_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_sessions
    ADD CONSTRAINT dsa_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsa_user_questions dsa_user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: dsa_user_questions dsa_user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_questions user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: user_questions user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Wrle2bqzcyudF2cb3GYFVKcgOTVewd4aEi6k1JHXvEJ2YwSXcaZXjAGf8jeE2Cl

