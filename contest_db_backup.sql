--
-- PostgreSQL database dump
--

\restrict vrhzLFizgb7Y4pFNezhxvICPkKmAKQMJ6t8ZYufVUUsM4AKZBYPf9l9qvul7nGu

-- Dumped from database version 13.23 (Debian 13.23-1.pgdg13+1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-0ubuntu0.22.04.1)

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
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    token character varying(255)
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attempts (
    id integer NOT NULL,
    user_id integer,
    question_id integer,
    code text,
    status character varying(50),
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.attempts OWNER TO postgres;

--
-- Name: attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attempts_id_seq OWNER TO postgres;

--
-- Name: attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attempts_id_seq OWNED BY public.attempts.id;


--
-- Name: cascade_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cascade_sessions (
    id integer NOT NULL,
    user_id integer,
    join_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    current_streak integer DEFAULT 0,
    max_streak integer DEFAULT 0,
    highest_forward_index integer DEFAULT 0,
    is_review_mode boolean DEFAULT false,
    current_viewing_index integer DEFAULT 0,
    streak_bonus_applied boolean DEFAULT false
);


ALTER TABLE public.cascade_sessions OWNER TO postgres;

--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cascade_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cascade_sessions_id_seq OWNER TO postgres;

--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cascade_sessions_id_seq OWNED BY public.cascade_sessions.id;


--
-- Name: cascade_user_questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.cascade_user_questions OWNER TO postgres;

--
-- Name: dsa_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dsa_sessions (
    id integer NOT NULL,
    user_id integer,
    join_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    total_score integer DEFAULT 0
);


ALTER TABLE public.dsa_sessions OWNER TO postgres;

--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dsa_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dsa_sessions_id_seq OWNER TO postgres;

--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dsa_sessions_id_seq OWNED BY public.dsa_sessions.id;


--
-- Name: dsa_user_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dsa_user_questions (
    user_id integer NOT NULL,
    question_id integer NOT NULL,
    sequence_order integer NOT NULL,
    status character varying(20) DEFAULT NULL::character varying,
    base_points integer DEFAULT 0,
    accepted_at timestamp without time zone
);


ALTER TABLE public.dsa_user_questions OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    avg_time integer DEFAULT 180,
    round character varying(50) DEFAULT 'rapidfire'::character varying,
    base_points integer DEFAULT 10,
    sequence_order integer DEFAULT 0
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: round_control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.round_control (
    round_name character varying(50) NOT NULL,
    start_time timestamp with time zone,
    is_active boolean DEFAULT false
);


ALTER TABLE public.round_control OWNER TO postgres;

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_cases (
    id integer NOT NULL,
    problem_id character varying(50) NOT NULL,
    input text NOT NULL,
    expected_output text NOT NULL,
    is_hidden boolean DEFAULT true
);


ALTER TABLE public.test_cases OWNER TO postgres;

--
-- Name: test_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_cases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_cases_id_seq OWNER TO postgres;

--
-- Name: test_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_cases_id_seq OWNED BY public.test_cases.id;


--
-- Name: user_questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_questions OWNER TO postgres;

--
-- Name: user_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_questions_id_seq OWNER TO postgres;

--
-- Name: user_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_questions_id_seq OWNED BY public.user_questions.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer,
    socket_id character varying(255),
    join_time timestamp with time zone,
    end_time timestamp with time zone
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_sessions_id_seq OWNER TO postgres;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts ALTER COLUMN id SET DEFAULT nextval('public.attempts_id_seq'::regclass);


--
-- Name: cascade_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_sessions ALTER COLUMN id SET DEFAULT nextval('public.cascade_sessions_id_seq'::regclass);


--
-- Name: dsa_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_sessions ALTER COLUMN id SET DEFAULT nextval('public.dsa_sessions_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: test_cases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_cases ALTER COLUMN id SET DEFAULT nextval('public.test_cases_id_seq'::regclass);


--
-- Name: user_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_questions ALTER COLUMN id SET DEFAULT nextval('public.user_questions_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, username, password, token) FROM stdin;
1	admin	admin123	ADMIN_TOKEN_SECRET
\.


--
-- Data for Name: attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attempts (id, user_id, question_id, code, status, "timestamp") FROM stdin;
\.


--
-- Data for Name: cascade_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cascade_sessions (id, user_id, join_time, end_time, current_streak, max_streak, highest_forward_index, is_review_mode, current_viewing_index, streak_bonus_applied) FROM stdin;
1	3	2026-02-25 21:24:34.616	2026-02-25 22:24:34.616	3	3	3	f	3	f
2	1	2026-02-25 22:28:42.678	2026-02-25 23:28:42.678	0	0	0	f	0	f
\.


--
-- Data for Name: cascade_user_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cascade_user_questions (user_id, question_id, sequence_order, status, base_points, is_streak_eligible, score_awarded) FROM stdin;
3	4	3	\N	10	t	0
3	5	4	\N	10	t	0
3	6	5	\N	10	t	0
3	7	6	\N	10	t	0
3	8	7	\N	10	t	0
3	9	8	\N	10	t	0
3	10	9	\N	10	t	0
3	11	10	\N	10	t	0
3	12	11	\N	10	t	0
3	13	12	\N	10	t	0
3	14	13	\N	10	t	0
3	15	14	\N	10	t	0
3	1	0	ACCEPTED	10	t	12
3	2	1	ACCEPTED	10	t	12
3	3	2	ACCEPTED	10	t	12
1	1	0	\N	10	t	0
1	2	1	\N	10	t	0
1	3	2	\N	10	t	0
1	4	3	\N	10	t	0
1	5	4	\N	10	t	0
1	6	5	\N	10	t	0
1	7	6	\N	10	t	0
1	8	7	\N	10	t	0
1	9	8	\N	10	t	0
1	10	9	\N	10	t	0
1	11	10	\N	10	t	0
1	12	11	\N	10	t	0
1	13	12	\N	10	t	0
1	14	13	\N	10	t	0
1	15	14	\N	10	t	0
\.


--
-- Data for Name: dsa_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dsa_sessions (id, user_id, join_time, end_time, total_score) FROM stdin;
1	1	2026-02-25 22:30:36.493	2026-02-26 00:30:36.493	0
\.


--
-- Data for Name: dsa_user_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dsa_user_questions (user_id, question_id, sequence_order, status, base_points, accepted_at) FROM stdin;
1	31	0	\N	100	\N
1	32	1	\N	200	\N
1	33	2	\N	300	\N
1	34	3	\N	400	\N
1	35	4	\N	500	\N
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, title, description, avg_time, round, base_points, sequence_order) FROM stdin;
16	Celsius to Fahrenheit	Convert Celsius to Fahrenheit. Formula: (C * 9/5) + 32. Print integer part.	180	rapidfire	10	0
17	Power of Two	Check if a number is a power of two. Print 'Yes' or 'No'.	180	rapidfire	10	0
18	Multiple of 5	Check if a number is a multiple of 5. Print 'Yes' or 'No'.	180	rapidfire	10	0
19	Area of Rectangle	Given length and width, print area.	180	rapidfire	10	0
20	Swap Two Numbers	Given two numbers, print them in swapped order separated by a space.	180	rapidfire	10	0
21	Cube of Number	Print the cube of a given number.	180	rapidfire	10	0
22	Uppercase Conversion	Convert a lowercase character to uppercase.	180	rapidfire	10	0
23	Check Positive Negative	Check if a number is Positive, Negative or Zero.	180	rapidfire	10	0
24	Print ASCII Value	Print the ASCII value of a given character.	180	rapidfire	10	0
25	Sum of First N Numbers	Print sum of first N natural numbers.	180	rapidfire	10	0
26	Absolute Value	Print the absolute value of an integer.	180	rapidfire	10	0
27	Check Alphabet	Check if a character is an alphabet. Print 'Yes' or 'No'.	180	rapidfire	10	0
28	Divisible by 3 and 5	Check if a number is divisible by both 3 and 5. Print 'Yes' or 'No'.	180	rapidfire	10	0
29	Last Digit	Print the last digit of a number.	180	rapidfire	10	0
30	Check Voting Age	Given age, print 'Eligible' if age >= 18, else 'Not Eligible'.	180	rapidfire	10	0
1	Sum of Two Numbers	Write a program that takes two integers as input and prints their sum.	180	cascade	10	1
2	Check Even or Odd	Write a program that takes an integer as input and prints 'Even' if it is even, and 'Odd' if it is odd.	180	cascade	10	2
3	Factorial of a Number	Write a program to find the factorial of a given number N.	180	cascade	10	3
4	Reverse a String	Write a program that takes a string as input and prints its reverse.	180	cascade	10	4
5	Find Maximum of Three	Write a program that takes three integers as input and prints the largest one.	180	cascade	10	5
6	Check Prime Number	Write a program to check if a given number N is prime. Print 'Yes' if prime, 'No' otherwise.	180	cascade	10	6
7	Fibonacci Sequence	Write a program to print the Nth number in the Fibonacci sequence (0-indexed). F(0)=0, F(1)=1.	180	cascade	10	7
8	Count Vowels	Write a program to count the number of vowels (a, e, i, o, u) in a given string (case insensitive).	180	cascade	10	8
9	Palindrome Check	Write a program to check if a given string is a palindrome. Print 'Yes' or 'No'.	180	cascade	10	9
10	Sum of Array Arguments	Given N, followed by N integers, print their sum.	180	cascade	10	10
11	Find Minimum Element	Given N, followed by N integers. Print the minimum element.	180	cascade	10	11
12	Square Check	Check if a given number is a perfect square. Print 'Yes' or 'No'.	180	cascade	10	12
13	Simple Interest	Calculate Simple Interest given multiple lines: Principal, Rate, Time. Print floor value.	180	cascade	10	13
14	Print 1 to N	Print numbers from 1 to N separated by space.	180	cascade	10	14
15	Leap Year	Check if a year is a leap year. Print 'Yes' or 'No'.	180	cascade	10	15
31	Alien Language Validation	You are given a dictionary of words representing an alien language. Ensure the sequence of words is sorted lexicographically according to a specific given alien alphabet string.\n**Input**: `words = ["hello","leetcode"]`, `order = "hlabcdefgijkmnopqrstuvwxyz"`\n**Output**: `true`	180	dsa	100	0
32	Martian Supply Routes	Given an adjacency list representing paths between martian outposts, find the shortest path from outpost `A` to outpost `B`.\n**Input**: `graph = [[1,2],[0,3],[0,3],[1,2]], A = 0, B = 3`\n**Output**: `2`	180	dsa	200	1
33	Rover Signal Synchronization	Given two strings `s` and `t`, return the length of their longest common subsequence. This determines the signal sync strength.\n**Input**: `s = "abcde", t = "ace"`\n**Output**: `3`	180	dsa	300	2
34	Asteroid Mining Optimization	You are given an array of asteroid masses. You have a laser of power `k`. Return the maximum number of asteroids you can destroy if destroying an asteroid of mass `m` takes `m` power and reduces your laser power to `k - m`.\n**Input**: `asteroids = [1, 2, 3, 4, 5], k = 7`\n**Output**: `3`	180	dsa	400	3
35	Comm-Link Encryption Sequence	Find the longest palindromic substring in the given comm-link transmission string `s`.\n**Input**: `s = "babad"`\n**Output**: `bab`	180	dsa	500	4
\.


--
-- Data for Name: round_control; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.round_control (round_name, start_time, is_active) FROM stdin;
cascade	2026-02-25 16:58:32.543+00	f
dsa	2026-02-25 17:00:28.686+00	f
rapidfire	2026-02-25 17:01:22.297+00	f
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, user_id, problem_id, source_code, language_id, status, stdout, stderr, execution_time, created_at) FROM stdin;
1	1	\N	#include <iostream> \nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello I am saketh from class 10a1" << n << "\\n";\n}	54	ACCEPTED	Hello I am saketh from class 10a10\n		0.007	2026-02-14 06:23:20.575931
21	1	\N	#include <iostream> \nint main()\n{\n    int n;\n    std::cout << n; \n}	54	ACCEPTED	0		0.004	2026-02-14 06:31:04.25685
2	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:48.409901
3	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:58.252872
29	1	\N	import java.util.*;\n\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println("Hello " + n ); \n    }\n}	62	ACCEPTED	Hello 123\n		0.117	2026-02-14 09:04:33.618608
4	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:58.787241
22	1	\N	#include <iostream> \nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << n; \n}	54	ACCEPTED	1123		0.007	2026-02-14 06:31:19.017577
5	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:59.141278
6	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:59.331117
7	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:59.523607
23	1	\N	print("Hello I am saketh")	71	ACCEPTED	Hello I am saketh\n		0.026	2026-02-14 06:31:33.689934
8	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:59.714751
9	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:24:59.882583
32	1	\N	import java.util.*;\n\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println("Hello " + n ); \n    }\n}	62	ACCEPTED	Hello 123\n		0.109	2026-02-14 09:09:47.297451
10	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:25:00.074566
24	1	\N	class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n);\n    }\n}	62	WRONG_ANSWER			0	2026-02-14 06:41:19.312354
11	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:25:00.25102
12	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:25:00.450338
30	1	\N	import java.util.*;\n\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println("Hello " + n ); \n    }\n}	62	ACCEPTED	Hello 123\n		0.112	2026-02-14 09:04:47.896307
13	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-14 06:25:00.642568
25	1	\N	class Solution\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n);\n    }\n}	62	WRONG_ANSWER			0	2026-02-14 06:41:38.200549
14	1	\N	print("Hello world ")	71	ACCEPTED	Hello world \n		0.021	2026-02-14 06:25:54.007708
15	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 12\n		0.005	2026-02-14 06:26:14.609662
16	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 2147483647\n		0.005	2026-02-14 06:26:22.355571
26	1	\N	public class Solution\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n);\n    }\n}	62	WRONG_ANSWER			0	2026-02-14 06:41:57.212889
17	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 2147483647\n		0.006	2026-02-14 06:26:29.081404
18	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 121\n		0.006	2026-02-14 06:26:40.297367
19	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 121\n		0.006	2026-02-14 06:30:42.106719
27	1	\N	#include <iostream> \nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "HJello " << n << "\\n";\n}	54	ACCEPTED	HJello 0\n		0.008	2026-02-14 09:02:51.496538
20	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << "Hello i am saketh " << n << "\\n";\n}	54	ACCEPTED	Hello i am saketh 121\n		0.006	2026-02-14 06:30:43.012733
31	1	\N	import java.util.*;\n\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println("Hello " + n ); \n    }\n}	62	ACCEPTED	Hello 123\n		0.104	2026-02-14 09:05:24.336225
28	1	\N	print("Hello wo")               	71	ACCEPTED	Hello wo\n		0.037	2026-02-14 09:03:33.073389
34	1	\N	#include <iostream>\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << n << "Hello I am saketh from class 10a1";\n}	54	ACCEPTED	123Hello I am saketh from class 10a1		0.006	2026-02-14 10:43:06.273365
33	1	\N	import java.util.*;\n\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println("Hello " + n ); \n    }\n}	62	ACCEPTED	Hello 123\n		0.08	2026-02-14 09:09:49.546395
36	1	\N	#include <iostream>\nint main()\n{\n    std::cout << "Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes ";\n}	54	ACCEPTED	Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes 		0.006	2026-02-14 10:43:52.792727
35	1	\N	#include <iostream>\nint main()\n{\n    std::cout << "Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes ";\n}	54	ACCEPTED	Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes 		0.006	2026-02-14 10:43:41.207549
37	1	\N	#include <iostream>\nint main()\n{\n    std::cout << "Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes ";\n}	54	ACCEPTED	Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes 		0.006	2026-02-14 10:43:57.472925
38	1	\N	print("Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes ")\n	71	ACCEPTED	Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes \n		0.021	2026-02-14 10:44:31.709084
180	1	\N	a = int(input())\nb = int(input())\n\nprint(a,b)	71	ERROR	5 10\n	Error on Test Case 1	0	2026-02-15 16:47:41.725233
77	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	10		0.006	2026-02-14 19:23:50.410679
39	1	\N	public class Main\n{\n    public static void main(String[] args)\n    {\n        System.out.println("Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes");\n    }\n}	62	ACCEPTED	Hello sudhamsh I am saketh from class 10a1 hahalksfl, right, and okay, and ah we will mostly have three classes\n		0.063	2026-02-14 10:45:01.738851
59	1	\N	print("Hello world saketh hahahasaketh ")	54	FAILED	\N	column "question_id" does not exist	\N	2026-02-14 19:00:03.282304
40	1	\N	#include <iostream>\n\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    std::cout << n << "\\n";\n}	54	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-14 17:52:29.173744
41	1	\N	#include <iostream>\n\n\nint main()\n{\n    std::cout << "Hello";\n}	54	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-14 17:54:40.155447
71	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.025	2026-02-14 19:22:44.097297
42	1	\N	#include <iostream>\n\n\nint main()\n{\n    std::cout << "Hello";\n}	54	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-14 17:56:33.705666
60	1	\N	print("hhhhh")	71	FAILED	\N	column "question_id" does not exist	\N	2026-02-14 19:02:24.868133
43	1	\N	#include <iostream>\nint main()\n{\n    std::cout << "Hello ";          \n}	54	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-14 17:59:48.107195
45	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.031	2026-02-14 18:02:38.575692
61	1	\N	print("hhhhh")	71	FAILED	\N	column "question_id" does not exist	\N	2026-02-14 19:06:42.846158
44	1	\N	print("hello world11")	71	ACCEPTED	hello world11\n		0.016	2026-02-14 18:02:13.288462
46	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.025	2026-02-14 18:46:31.803419
47	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-14 18:46:33.728074
62	1	\N	print("Hello world")	71	ERROR	Hello world\n	Error on Test Case 1	0	2026-02-14 19:15:03.703763
48	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.023	2026-02-14 18:46:34.571922
49	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-14 18:46:35.449368
72	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.01	2026-02-14 19:22:56.670915
50	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-14 18:46:44.105135
63	1	\N	print("Hello world")	71	ERROR	Hello world\n	Error on Test Case 1	0	2026-02-14 19:15:07.2527
51	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.019	2026-02-14 18:46:45.971957
52	1	\N	print("Heldlo")	71	ACCEPTED	Heldlo\n		0.019	2026-02-14 18:46:50.771225
53	1	\N	print("Heldlo")	71	ACCEPTED	Heldlo\n		0.022	2026-02-14 18:51:04.890975
64	1	\N	print("Hello world")	71	ERROR	Hello world\n	Error on Test Case 1	0	2026-02-14 19:15:10.331146
54	1	\N	print("Hello world saketh hahahasaketh ")	71	ACCEPTED	Hello world saketh hahahasaketh \n		0.015	2026-02-14 18:51:25.682605
55	1	\N	print("Hello world saketh hahahasaketh ")	71	ACCEPTED	Hello world saketh hahahasaketh \n		0.022	2026-02-14 18:51:30.425366
84	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	10		0.007	2026-02-14 19:25:26.86387
56	1	\N	print("Hello world saketh hahahasaketh ")	71	ACCEPTED	Hello world saketh hahahasaketh \n		0.028	2026-02-14 18:52:43.992517
65	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.007	2026-02-14 19:18:11.596958
57	1	\N	print("Hello world saketh hahahasaketh ")	71	ACCEPTED	Hello world saketh hahahasaketh \n		0.024	2026-02-14 18:52:45.001248
58	1	\N	print("Hello world saketh hahahasaketh ")	71	ACCEPTED	Hello world saketh hahahasaketh \n		0.025	2026-02-14 18:52:45.82222
73	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	0		0.007	2026-02-14 19:23:30.425881
66	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a);\n}	54	ERROR	2	Error on Test Case 1	0	2026-02-14 19:18:20.581688
67	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a);\n}	54	ERROR	2	Error on Test Case 1	0	2026-02-14 19:18:28.068244
78	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	10		0.006	2026-02-14 19:23:52.55937
68	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a);\n}	54	ACCEPTED	0		0.006	2026-02-14 19:21:51.049278
74	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	10		0.006	2026-02-14 19:23:39.792946
69	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.024	2026-02-14 19:22:40.755437
70	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.019	2026-02-14 19:22:43.275079
75	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.006	2026-02-14 19:23:41.467522
81	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.006	2026-02-14 19:24:44.848393
76	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.006	2026-02-14 19:23:46.132145
79	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	10		0.006	2026-02-14 19:23:53.630103
83	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a);\n}	54	ACCEPTED	1		0.006	2026-02-14 19:25:03.601727
80	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.006	2026-02-14 19:23:55.041333
82	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a);\n}	54	ERROR	2	Error on Test Case 1	0	2026-02-14 19:24:57.416121
85	1	\N	#include <iostream>\n\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.007	2026-02-14 19:25:28.681853
86	1	\N	print("Hello this should fail")	71	ACCEPTED	Hello this should fail\n		0.024	2026-02-14 19:36:21.360922
87	1	\N	print("Hello this should fail")	71	ERROR	Hello this should fail\n	Error on Test Case 1	0	2026-02-14 19:36:23.22517
88	1	\N	#include <iostream>\n\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-14 19:36:58.930301
89	1	\N	print("This should fail")	71	ACCEPTED	This should fail\n		0.034	2026-02-14 19:37:49.065527
90	1	\N	print("This should fail")	71	ERROR	This should fail\n	Error on Test Case 1	0	2026-02-14 19:37:50.712071
342	3	\N	n=int(input())	71	ERROR		Error on Test Case 1	0	2026-02-18 11:08:00.902087
104	1	\N	#include <iostream>\nint main()\n{\n    int a, b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED			0.007	2026-02-14 19:41:13.537403
91	1	\N	#include <iostream>\n#include <reverse>\n#include <algorithm>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ERROR			\N	2026-02-14 19:38:12.976129
92	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ACCEPTED			0.006	2026-02-14 19:38:38.159866
117	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.021	2026-02-15 11:41:50.741602
93	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ACCEPTED	htekas		0.005	2026-02-14 19:38:46.841288
105	1	\N		71	FAILED	\N	No test cases found for problem 23	\N	2026-02-15 10:35:21.825828
94	1	\N	print("This should fail")	71	ACCEPTED	This should fail\n		0.026	2026-02-14 19:39:13.063859
95	1	\N	print("This should fail")	71	ERROR	This should fail\n	Error on Test Case 1	0	2026-02-14 19:39:14.773977
96	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ACCEPTED	htekas		0.007	2026-02-14 19:39:21.428571
106	1	\N	#include <iostream>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-15 10:38:39.120048
97	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ERROR	detubirtsiD	Error on Test Case 2	0.007	2026-02-14 19:39:26.973541
98	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ACCEPTED	htekas		0.003	2026-02-14 19:40:14.457406
135	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.021	2026-02-15 11:58:03.553206
99	1	\N	#include <bits/stdc++.h>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;    \n}	54	ERROR	detubirtsiD	Error on Test Case 2	0.007	2026-02-14 19:40:17.650782
107	1	\N	#include <iostream>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-15 10:38:46.714043
100	1	\N	print("Thisshouldfail")	71	ACCEPTED	Thisshouldfail\n		0.022	2026-02-14 19:40:33.939746
101	1	\N	print("Thisshouldfail")	71	ERROR	Thisshouldfail\n	Error on Test Case 1	0	2026-02-14 19:40:36.614796
118	1	\N	print("hello world")	71	ERROR	hello world\n	Error on Test Case 1	0	2026-02-15 11:41:52.451677
102	1	\N	#include <iostream>\nint main()\n{\n    int a, b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	0		0.006	2026-02-14 19:41:02.546557
108	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.032	2026-02-15 10:40:44.977765
103	1	\N	#include <iostream>\nint main()\n{\n    int a, b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n}	54	ACCEPTED	246		0.006	2026-02-14 19:41:11.775171
127	1	\N	print("hello")	71	ACCEPTED	hello\n		0.023	2026-02-15 11:54:36.107263
109	1	\N	print("hello")	71	ACCEPTED	hello\n		0.016	2026-02-15 10:40:56.072381
119	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.018	2026-02-15 11:41:54.724486
110	1	\N	print("hello")	71	FAILED	\N	No test cases found for problem 20	\N	2026-02-15 10:40:57.847789
111	1	\N	#include <iostream>\n\nint main()\n{\n    std::string sak;\n    std::cin >> sak;\n    \n}	54	ACCEPTED			0.008	2026-02-15 10:48:23.433119
112	1	\N	print("Helo")	71	ACCEPTED	Helo\n		0.022	2026-02-15 10:49:54.095942
120	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.022	2026-02-15 11:44:25.76304
113	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.023	2026-02-15 11:41:41.306906
114	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.021	2026-02-15 11:41:46.320341
132	1	\N	print("Hello")	71	ERROR	Hello\n	Error on Test Case 1	0	2026-02-15 11:57:56.354372
115	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.019	2026-02-15 11:41:48.508992
121	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-15 11:44:37.478357
116	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.021	2026-02-15 11:41:49.684921
128	1	\N	print("H")	71	ACCEPTED	H\n		0.021	2026-02-15 11:54:41.941874
122	1	\N	print("Hello world")	71	ACCEPTED	Hello world\n		0.021	2026-02-15 11:44:43.092547
123	1	\N	print("Hello world")	71	ERROR	Hello world\n	Error on Test Case 1	0	2026-02-15 11:44:57.348793
129	1	\N	n = int(input())\n\nprint(n%10)	71	ACCEPTED			0.022	2026-02-15 11:54:58.662088
124	1	\N	n = int(input())\n\nprint(n + " HAHAHAH")	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 3, in <module>\n    print(n + " HAHAHAH")\nTypeError: unsupported operand type(s) for +: 'int' and 'str'\n	0.023	2026-02-15 11:52:53.0227
125	1	\N	n = int(input())\n\nprint(n)	71	ACCEPTED	123\n		0.02	2026-02-15 11:53:06.94984
126	1	\N	print("Hello saketh")	71	ACCEPTED	Hello saketh\n		0.021	2026-02-15 11:53:56.628438
130	1	\N	print("helo")	71	ERROR	helo\n	Error on Test Case 1	0	2026-02-15 11:55:05.980327
133	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.02	2026-02-15 11:57:58.003619
131	1	\N	#include <bits/stdc++.h>\n\nint main()\n{\n    char c;\n    std::cin >> c;\n    std::cout << toupper(c);\n}	54	ACCEPTED	65		0.007	2026-02-15 11:57:33.905152
134	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.019	2026-02-15 11:58:02.598929
138	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-15 11:58:04.589861
136	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.02	2026-02-15 11:58:04.051093
137	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.024	2026-02-15 11:58:04.376507
139	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-15 11:58:04.94492
140	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.019	2026-02-15 11:58:05.317326
141	1	\N	#include <bits/stdc++.h>\n\nint main()\n{\n    int a,b,c;\n    std::cin >> a >> b >> c;\n    std::cout << std::max(a,std::max(b,c));    \n}	54	ACCEPTED	12312		0.007	2026-02-15 11:59:10.743594
142	1	\N	#include <bits/stdc++.h>\n\nint main()\n{\n    int a,b,c;\n    std::cin >> a >> b >> c;\n    std::cout << std::max(a,std::max(b,c));    \n}	54	ACCEPTED			0.007	2026-02-15 11:59:13.530498
143	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.022	2026-02-15 12:06:48.831158
144	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.021	2026-02-15 12:22:12.556972
145	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.019	2026-02-15 12:22:14.157801
175	1	\N	print("Hell")	71	ACCEPTED	Hell\n		0.025	2026-02-15 16:28:26.065641
146	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int f = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        f = f*i;\n    }\n    std::cout << f;\n}	54	ACCEPTED	0		0.005	2026-02-15 12:23:17.480987
157	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-15 15:56:11.879015
147	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int f = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        f = f*i;\n    }\n    std::cout << f;\n}	54	ACCEPTED	479001600		0.006	2026-02-15 12:23:23.123722
148	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int f = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        f = f*i;\n    }\n    std::cout << f;\n}	54	ACCEPTED			0.007	2026-02-15 12:23:27.254967
168	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.021	2026-02-15 16:25:42.042866
149	1	\N	# factorial using loop\n\nn = int(input("Enter a number: "))\n\nfact = 1\n\nif n < 0:\n    print("Factorial does not exist for negative numbers")\nelif n == 0:\n    print("Factorial is 1")\nelse:\n    for i in range(1, n + 1):\n        fact = fact * i\n    print("Factorial of", n, "is", fact)\n	71	ERROR	Enter a number: 	Traceback (most recent call last):\n  File "script.py", line 3, in <module>\n    n = int(input("Enter a number: "))\nEOFError: EOF when reading a line\n	0.018	2026-02-15 15:32:41.963916
158	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a << "\\n";\n}	54	ACCEPTED	0\n		0.007	2026-02-15 15:56:58.752937
150	1	\N	# factorial using loop\n\nn = int(input())\n\nfact = 1\n\nif n < 0:\n    print("Factorial does not exist for negative numbers")\nelif n == 0:\n    print("1")\nelse:\n    for i in range(1, n + 1):\n        fact = fact * i\n    print(n)\n	71	ACCEPTED	8\n		0.024	2026-02-15 15:33:12.45786
151	1	\N	# factorial using loop\n\nn = int(input())\n\nfact = 1\n\nif n < 0:\n    print("Factorial does not exist for negative numbers")\nelif n == 0:\n    print("1")\nelse:\n    for i in range(1, n + 1):\n        fact = fact * i\n    print(n)\n	71	ERROR	5\n	Error on Test Case 1	0	2026-02-15 15:33:14.676329
164	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n}	54	FAILED	Even	column "completed_at" of relation "user_questions" does not exist	0.006	2026-02-15 16:22:07.977908
152	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a ;\n}	54	ACCEPTED	40320		0.006	2026-02-15 15:33:49.80832
159	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a << "\\n";\n}	54	ACCEPTED	24\n		0.007	2026-02-15 15:57:08.404006
153	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a ;\n}	54	ACCEPTED			0.006	2026-02-15 15:33:52.09301
154	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-15 15:56:09.446429
155	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-15 15:56:10.634299
160	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a << "\\n";\n}	54	ACCEPTED			0.007	2026-02-15 15:57:10.116136
156	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-15 15:56:11.117499
161	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a;\n}	54	ACCEPTED	0		0.007	2026-02-15 16:01:28.387116
172	1	\N	\nnum = int(input())\n\n# Check even or odd\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    num = int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-15 16:26:32.881795
162	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a;\n}	54	ACCEPTED	720		0.006	2026-02-15 16:01:34.896349
165	1	\N	#include <iostream> \n\nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n}	54	FAILED		column "completed_at" of relation "user_questions" does not exist	0.008	2026-02-15 16:22:12.62291
163	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    int a = 1;\n    for(int i = 1;i<=n;++i)\n    {\n        a = a * i;\n    }\n    std::cout << a;\n}	54	ACCEPTED			0.008	2026-02-15 16:01:36.860931
169	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.026	2026-02-15 16:25:43.14617
166	1	\N	#include <iostream> \nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    std::cout << "Even";\n    else\n    std::cout << "Odd";\n}	54	ACCEPTED	Even		0.008	2026-02-15 16:25:12.076595
167	1	\N	print("Hello")	71	ACCEPTED	Hello\n		0.02	2026-02-15 16:25:39.939431
170	1	\N	# Take integer input\nnum = int(input(""))\n\n# Check even or odd\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    num = int(input(""))\nEOFError: EOF when reading a line\n	0.027	2026-02-15 16:26:08.639828
174	1	\N	\nnum = int(input())\n\n# Check even or odd\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n	71	ACCEPTED			0.025	2026-02-15 16:27:11.119372
171	1	\N	# Take integer input\nnum = int(input())\n\n# Check even or odd\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    num = int(input())\nEOFError: EOF when reading a line\n	0.019	2026-02-15 16:26:16.856345
173	1	\N	\nnum = int(input())\n\n# Check even or odd\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n	71	ACCEPTED	Even\n		0.023	2026-02-15 16:27:09.526211
177	1	\N	a = int(input())\nb = int(input())\n\nprint(a + " " + b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a = int(input())\nValueError: invalid literal for int() with base 10: '1 2'\n	0.021	2026-02-15 16:46:03.534638
176	1	\N	a = int(input())\nb = int(input())\n\nprint(a + " " + b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a = int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-15 16:45:54.175393
178	1	\N	a = int(input())\nb = int(input())\n\nprint(a,b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a = int(input())\nValueError: invalid literal for int() with base 10: '1 2'\n	0.02	2026-02-15 16:47:22.965197
179	1	\N	a = int(input())\nb = int(input())\n\nprint(a,b)	71	ACCEPTED	1 2\n		0.014	2026-02-15 16:47:39.107699
343	3	\N	n=int(input())	71	ERROR		Error on Test Case 1	0	2026-02-18 11:08:02.64352
181	1	\N	a, b = map(int, input().split())\n\nprint(a, b)\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a, b = map(int, input().split())\nEOFError: EOF when reading a line\n	0.014	2026-02-15 16:48:11.502028
199	1	\N	import math\n\nP = float(input())\nR = float(input())\nT = float(input())\n\nsi = (P * R * T) / 100\nprint(math.floor(si))\n	71	ACCEPTED	0\n		0.024	2026-02-16 07:33:28.642924
182	1	\N	num = int(input())\nprint(num ** 3)\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num = int(input())\nValueError: invalid literal for int() with base 10: ' '\n	0.024	2026-02-15 16:48:31.326627
183	1	\N	num = int(input())\nprint(num ** 3)\n	71	ACCEPTED			0.03	2026-02-15 16:48:33.590524
217	1	\N	n=int(input())\n\nif n%2==0:\n    print("even")\nelse:\n    print("odd")	71	ERROR	even\n	Error on Test Case 1	0	2026-02-16 09:14:09.987214
184	1	\N	num = int(input())\n\nif num % 3 == 0 and num % 5 == 0:\n    print("Yes")\nelse:\n    print("No")\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num = int(input())\nEOFError: EOF when reading a line\n	0.027	2026-02-15 16:48:56.653211
200	1	\N	import math\n\nP = float(input())\nR = float(input())\nT = float(input())\n\nsi = (P * R * T) / 100\nprint(math.floor(si))\n	71	ACCEPTED			0.022	2026-02-16 07:33:32.514138
185	1	\N	num = int(input())\n\nif num % 3 == 0 and num % 5 == 0:\n    print("Yes")\nelse:\n    print("No")\n	71	ACCEPTED			0.02	2026-02-15 16:48:58.158217
186	1	\N	num = int(input())\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num = int(input())\nEOFError: EOF when reading a line\n	0.023	2026-02-15 16:51:14.629181
211	1	\N	def fibonacci(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n\n    a, b = 0, 1\n    for i in range(2, n + 1):\n        a, b = b, a + b\n\n    return b\n\n\nn = int(input("Enter N: "))\nprint("Fibonacci number:", fibonacci(n))\n	71	FAILED	\N	connect EHOSTUNREACH 192.168.1.69:2358	\N	2026-02-16 08:52:00.242765
187	1	\N	num = int(input())\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n\n	71	ACCEPTED			0.027	2026-02-15 16:51:16.467125
201	1	\N	print("Hello world")	71	ACCEPTED	Hello world\n		0.02	2026-02-16 07:58:32.577444
188	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-16 06:58:58.21721
189	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-16 06:59:21.484292
190	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-16 06:59:36.757913
202	1	\N	x = int(input())\n\nprint(x**2)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    x = int(input())\nEOFError: EOF when reading a line\n	0.018	2026-02-16 08:01:05.300545
191	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    c = float(input())\nEOFError: EOF when reading a line\n	0.031	2026-02-16 07:00:57.073691
192	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	ACCEPTED	53\n		0.023	2026-02-16 07:01:00.773424
214	1	\N	n=int(input())\n\nif i%2==0:\n    print("even")\nelse:\n    print("odd")	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 3, in <module>\n    if i%2==0:\nNameError: name 'i' is not defined\n	0.02	2026-02-16 09:13:52.100988
193	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	ACCEPTED	21853\n		0.021	2026-02-16 07:01:04.694861
203	1	\N	x = int(input())\n\nprint(x**2)	71	ACCEPTED	144\n		0.018	2026-02-16 08:01:09.320367
194	1	\N	c = float(input())\nf = (c * 9/5) + 32\nprint(int(f))\n	71	ACCEPTED			0.022	2026-02-16 07:01:05.659437
195	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.021	2026-02-16 07:01:21.680939
212	1	\N	def fibonacci(n):\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n\n    a, b = 0, 1\n    for i in range(2, n + 1):\n        a, b = b, a + b\n\n    return b\n\n\nn = int(input("Enter N: "))\nprint("Fibonacci number:", fibonacci(n))\n	71	FAILED	\N	connect EHOSTUNREACH 192.168.1.69:2358	\N	2026-02-16 08:52:07.23767
196	1	\N	print("hello world")	71	ACCEPTED	hello world\n		0.021	2026-02-16 07:26:24.105546
204	1	\N	x = int(input())\n\nprint(x**2)	71	ERROR	64\n	Error on Test Case 1	0	2026-02-16 08:01:11.363097
197	1	\N	print("hello world")	71	ERROR	hello world\n	Error on Test Case 1	0	2026-02-16 07:26:26.799221
198	1	\N	print("helll ")	71	ACCEPTED	helll \n		0.022	2026-02-16 07:26:46.192418
205	1	\N	n = int(input())\n\nif n > 0 and (n & (n - 1)) == 0:\n    print("Yes")\nelse:\n    print("No")\n	71	ACCEPTED			0.022	2026-02-16 08:01:30.270039
213	1	\N	n=int(input())\n\nif i%2==0:\n    print("even")\nelse:\n    print("odd")	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    n=int(input())\nEOFError: EOF when reading a line\n	0.018	2026-02-16 09:13:45.426615
206	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 08:25:35.890533
207	1	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 08:25:36.793139
208	1	\N	print("Helo")	71	ACCEPTED	Helo\n		0.021	2026-02-16 08:25:42.89935
215	1	\N	n=int(input())\n\nif n%2==0:\n    print("even")\nelse:\n    print("odd")	71	ACCEPTED	odd\n		0.023	2026-02-16 09:13:59.509241
209	1	\N	print("Helo")	71	ERROR	Helo\n	Error on Test Case 1	0	2026-02-16 08:25:43.936477
210	1	\N	print("Helo")	71	ACCEPTED	Helo\n		0.019	2026-02-16 08:25:55.178238
216	1	\N	n=int(input())\n\nif n%2==0:\n    print("even")\nelse:\n    print("odd")	71	ACCEPTED	even\n		0.024	2026-02-16 09:14:06.695765
219	1	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    if(n%2==0)\n    {\n        cout << "Even";\n    }\n    else\n    {\n        cout << "Odd";\n    }\n}	54	ACCEPTED	Even		0.007	2026-02-16 09:15:27.812684
218	1	\N	n=int(input())\n\nif n%2==0:\n    print("even")\nelse:\n    print("odd")	71	ACCEPTED	even\n		0.021	2026-02-16 09:14:15.390599
220	1	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    if(n%2==0)\n    {\n        cout << "Even";\n    }\n    else\n    {\n        cout << "Odd";\n    }\n}	54	ACCEPTED			0.007	2026-02-16 09:15:35.704671
221	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n}	54	ACCEPTED	Even		0.006	2026-02-16 09:39:39.070905
222	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n}	54	ACCEPTED	Even		0.007	2026-02-16 09:39:42.120762
344	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:04.938488
345	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:05.702671
246	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    if (n > 0 && (n & (n - 1)) == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-16 10:52:17.341105
223	1	\N	#include <iostream>\n\nint main()\n{\n    int n;\n    std::cin >> n;\n    if(n%2 == 0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n}	54	ACCEPTED			0.007	2026-02-16 09:39:43.56444
237	1	\N	import java.util.*;\npublic class Main{\n    public static void main(String[]args){\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String.reverse(s);\n        System.out.println(s);\n    }\n}	62	ERROR		Main.java:6: error: cannot find symbol\n        String.reverse(s);\n              ^\n  symbol:   method reverse(String)\n  location: class String\n1 error\n	0	2026-02-16 10:34:09.086139
224	1	\N	#include <iostream>\nint main()\n{\n    char c;\n    std::cin >> c;\n    std::cout << (int)c;\n}	54	FAILED	\N	connect EHOSTUNREACH 192.168.1.69:2358	\N	2026-02-16 10:00:08.373325
225	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n\n    std::cout << a + b;\n}	54	FAILED	\N	connect EHOSTUNREACH 192.168.1.69:2358	\N	2026-02-16 10:15:42.617264
242	3	\N	#include<iostream>\nint main{\n    int n;\n    if(n>0 && (n&(n-1)==0))\n      std::cout<<"Yes";\n    else\n        std::cout<<"No";\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 10:51:57.473938
226	1	\N	#include <iostream>\nint main()\n{\n    int a,b;\n    std::cin >> a >> b;\n\n    std::cout << a + b;\n}	54	ACCEPTED	3		0.007	2026-02-16 10:16:54.450151
238	1	\N	public class Main {\n    public static void main(String[] args) {\n        String str = "Hello World";\n\n        String reversed = new StringBuilder(str).reverse().toString();\n\n        System.out.println(reversed);\n    }\n}\n	62	ERROR	dlroW olleH\n	Error on Test Case 1	0	2026-02-16 10:34:46.953641
227	1	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    if (n > 0 && (n & (n - 1)) == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}\n	54	ACCEPTED	Yes		0.007	2026-02-16 10:19:26.148306
228	1	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    if (n > 0 && (n & (n - 1)) == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-16 10:19:27.507869
229	1	\N	n = int(input())\n\nprint((n*(n+1))/2)	71	ACCEPTED	15.0\n		0.023	2026-02-16 10:25:04.314454
239	1	\N	import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String str = "Hello World";\n\n        String reversed = new StringBuilder(str).reverse().toString();\n\n        System.out.println(reversed);\n    }\n}\n	62	ERROR	dlroW olleH\n	Error on Test Case 1	0	2026-02-16 10:35:06.312983
230	1	\N	n = int(input())\n\nprint((n*(n+1))/2)	71	ERROR	15.0\n	Error on Test Case 1	0	2026-02-16 10:25:08.18639
231	1	\N	n = int(input())\n\nprint((int)(n*(n+1))/2)	71	ERROR	15.0\n	Error on Test Case 1	0	2026-02-16 10:25:16.011657
232	1	\N	n = int(input())\n\nprint((int)(n*(n+1))/2)	71	ERROR	15.0\n	Error on Test Case 1	0	2026-02-16 10:25:17.248079
240	1	\N	import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String str = sc.nextLine();\n\n        String reversed = new StringBuilder(str).reverse().toString();\n\n        System.out.println(reversed);\n    }\n}\n	62	ERROR	7\n	Error on Test Case 1	0	2026-02-16 10:35:58.727355
233	1	\N	n = int(input())\n\nprint((int)(n*(n+1))//2)	71	ACCEPTED	15\n		0.025	2026-02-16 10:25:39.425739
234	1	\N	n = int(input())\n\nprint((int)(n*(n+1))//2)	71	ACCEPTED			0.023	2026-02-16 10:25:40.818493
243	3	\N	#include<iostream>\nint main{\n    int n;\n    if(n>0 && (n&(n-1)==0))\n      std::cout<<"Yes";\n    else\n        std::cout<<"No";\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 10:51:59.64594
235	1	\N	n = int(input())\n# l=len(n)\nprint(n%10)	71	ACCEPTED			0.024	2026-02-16 10:31:39.379882
241	3	\N	#include<iostream>\nint main{\n    int n;\n    if(n>0 && (n&(n-1)==0))\n      std::cout<<"Yes";\n    else\n        std::cout<<"No";\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 10:51:47.772029
236	1	\N	import java.util.*;\npublic class Main{\n    public static void main(String[]args){\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String.reverse(s);\n        System.out.println(s);\n    }\n}	62	ERROR			\N	2026-02-16 10:34:06.603801
247	2	\N	int c = int(input())\nprint(int((c*9/5)+32))	71	ERROR		  File "script.py", line 1\n    int c = int(input())\n        ^\nSyntaxError: invalid syntax\n	0.021	2026-02-16 10:52:37.820529
244	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    if (n > 0 && (n & (n - 1)) == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}\n	54	ACCEPTED	No		0.003	2026-02-16 10:52:16.202883
245	2	\N	int c = int(input())\nprint(int(c*9/5)+32)	71	ERROR		  File "script.py", line 1\n    int c = int(input())\n        ^\nSyntaxError: invalid syntax\n	0.011	2026-02-16 10:52:16.497912
249	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    long long sum = 0;\n    for(int i = 0; i < n; i++) {\n        long long x;\n        cin >> x;\n        sum += x;\n    }\n\n    cout << sum;\n    return 0;\n}\n	54	ACCEPTED			0.006	2026-02-16 10:52:57.824903
248	1	\N	#include <iostream>\r\n\r\nint main()\r\n{\r\n    std::string str;\r\n    std::cin >> str;\r\n    int n = str.size();\r\n    int i = 0, r = n - 1;\r\n    bool hel = true;\r\n    while(i!=r)\r\n    {\r\n        if(str[i++]!=str[r--])\r\n        {\r\n            std::cout << "No";\r\n            hel = false;\r\n        }\r\n    }\r\n    if(hel)\r\n    {\r\n        std::cout << "Yes";\r\n    }\r\n	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 10:52:53.038284
250	1	\N	#include <iostream>\r\n\r\nint main()\r\n{\r\n    std::string str;\r\n    std::cin >> str;\r\n    int n = str.size();\r\n    int i = 0, r = n - 1;\r\n    bool hel = true;\r\n    while(i!=r)\r\n    {\r\n        if(str[i++]!=str[r--])\r\n        {\r\n            std::cout << "No";\r\n            hel = false;\r\n        }\r\n    }\r\n    if(hel)\r\n    {\r\n        std::cout << "Yes";\r\n    }\r\n	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 10:53:01.926072
251	3	\N	#include<iostream>\nint main(){\n    int n;\n    std::cin>>n;\n    std::cout<<n%10;\n}	54	ACCEPTED			0.007	2026-02-16 10:53:41.709781
252	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cout << abs(n);\r\n}	54	ACCEPTED	0		0.006	2026-02-16 10:53:47.086696
253	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cout << abs(n);\r\n}	54	ACCEPTED	0		0.007	2026-02-16 10:53:54.040689
254	2	\N	int n = int(input())\nprint(n%10)	71	ERROR		  File "script.py", line 1\n    int n = int(input())\n        ^\nSyntaxError: invalid syntax\n	0.02	2026-02-16 10:53:54.905375
346	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:06.711451
255	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cin >> n;\r\n    cout << abs(n);\r\n}	54	ACCEPTED	45		0.007	2026-02-16 10:54:05.029919
256	2	\N	int n = int(input)\nprint(n%10)	71	ERROR		  File "script.py", line 1\n    int n = int(input)\n        ^\nSyntaxError: invalid syntax\n	0.02	2026-02-16 10:54:05.862537
257	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cin >> n;\r\n    cout << abs(n);\r\n}	54	ACCEPTED			0.007	2026-02-16 10:54:07.19202
287	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n\n    int count = 0;\n\n    for(char c : s) {\n        c = tolower(c);\n        if(c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')\n            count++;\n    }\n\n    cout << count;\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-16 10:56:32.287685
258	2	\N	int n = int(input())\nprint(n%10)	71	ERROR		  File "script.py", line 1\n    int n = int(input())\n        ^\nSyntaxError: invalid syntax\n	0.02	2026-02-16 10:54:21.231122
279	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.75848
259	3	\N	#include<iostream>\nint main(){\n    int n;\n    std::cin>>n;\n    for(int i=0;i<=n;i++)\n    std::cout<<i<<" ";\n}	54	ACCEPTED	0 		0.006	2026-02-16 10:55:07.902329
260	3	\N	#include<iostream>\nint main(){\n    int n;\n    std::cin>>n;\n    for(int i=0;i<=n;i++)\n    std::cout<<i<<" ";\n}	54	ERROR	0 1 2 3 4 5 	Error on Test Case 1	0	2026-02-16 10:55:09.551991
261	3	\N	#include<iostream>\nint main(){\n    int n;\n    std::cin>>n;\n    for(int i=0;i<=n;i++)\n    std::cout<<i;\n}	54	ERROR	012345	Error on Test Case 1	0	2026-02-16 10:55:15.920004
280	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.914202
262	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:31.993935
263	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:32.182934
292	2	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    cout << n;\n}	54	ACCEPTED	1		0.006	2026-02-16 11:02:52.83105
264	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:32.387884
281	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:35.066479
265	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:32.694124
266	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:32.796237
288	2	\N	l=int(input())\nb=int(input())\nprint(l*b);	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nValueError: invalid literal for int() with base 10: '1 4'\n	0.019	2026-02-16 11:00:13.295693
267	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.103607
282	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:35.222574
268	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.206159
270	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.410929
283	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:35.405673
271	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.514022
272	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.717489
273	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:33.82051
284	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cin >> n;\r\n    for(int i=1;i<=n;i++)\r\n    {\r\n        cout << i << " ";\r\n    }\r\n\r\n}	54	ACCEPTED	1 2 3 4 5 6 		0.006	2026-02-16 10:55:40.536059
274	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.024703
275	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.127106
269	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cin >> n;\r\n    for(int i=1;i<=n;i++)\r\n    {\r\n        cout << i << " ";\r\n    }\r\n\r\n}	54	ACCEPTED			0.006	2026-02-16 10:55:33.406785
289	2	\N	l=int(input())\nb=int(input())\nprint(l*b);	71	ACCEPTED	4\n		0.02	2026-02-16 11:00:20.247526
276	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.333331
285	1	\N	#include <bits/stdc++.h>\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    int n;\r\n    cin >> n;\r\n    for(int i=1;i<=n;i++)\r\n    {\r\n        cout << i << " ";\r\n    }\r\n\r\n}	54	ACCEPTED			0.007	2026-02-16 10:55:43.751432
277	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.434956
278	2	\N		62	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-16 10:55:34.639859
286	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    for(int i = 1; i <= n; i++) {\n        cout << i << " ";\n    }\n\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-16 10:55:50.137005
296	3	\N	num = input()\nprint(num[-1] if len(num)>0 else False)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num = input()\nEOFError: EOF when reading a line\n	0.019	2026-02-16 11:42:23.195509
293	2	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nvoid main()\n{\n    int n;\n    cin >> n;\n    cout << n;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 11:02:59.481007
290	2	\N	l=int(input())\nb=int(input())\nprint(l*b);	71	ACCEPTED			0.022	2026-02-16 11:00:23.206327
291	2	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nvoid main()\n{\n    int n;\n    cin >> n;\n    cout << n;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-16 11:02:41.871997
295	1	\N	import math\n\n# Read inputs\nP = float(input().strip())\nR = float(input().strip())\nT = float(input().strip())\n\n# Calculate simple interest\nSI = (P * R * T) / 100\n\n# Print floor value\nprint(math.floor(SI))\n	71	ACCEPTED			0.024	2026-02-16 11:39:52.632904
294	2	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    cout << n;\n}	54	ACCEPTED	1		0.004	2026-02-16 11:03:06.951727
298	3	\N	num = input()\nprint(num[-1] if len(num)>0 else False)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num = input()\nEOFError: EOF when reading a line\n	0.022	2026-02-16 11:42:36.808926
297	3	\N	num = input()\nprint(num[-1] if len(num)>0 else False)	71	ACCEPTED	3\n		0.022	2026-02-16 11:42:31.197278
299	3	\N	num = input()\nprint(num[-1])	71	ACCEPTED			0.022	2026-02-16 11:42:43.262174
300	3	\N	num = int(input())\n\nprint(num**3)	71	ACCEPTED	512\n		0.022	2026-02-16 11:43:07.439123
301	3	\N	num = int(input())\n\nprint(num**3)	71	ACCEPTED	599285100440669477209323595764465568395647404032360839042070962864798566715976687098330416771641625\n		0.021	2026-02-16 11:43:12.566176
303	3	\N	num = int(input())\n\nprint(num**3)	71	ACCEPTED	599285100440669477209323595924238145077558477338353728233859810219760159471663293021705502156441148956359942480508598683474581001073727276125309854475627694469382387434571090577569308538161821425319299418228532355536153641437796611107033296689579410381671256668848638335839459830023968647603972646008666889808102931914041407420652230387511316028827825682674690047388486915262323679703585604039447373533962555021942242421581381951428606282143766901655788694369784624622350170682684529216428238843530747050476251579442031610574931203272110662757494321094256732407812175953287632364745840449484009821632302508668695475664026680259109796514839900827550586172913027719019003795851003387208629239741522600424484954541267445190463910645929923350040475113929215509468705638204653495363664926357759006643713248393295795853368773691534150603994777981188066063692298577921525800335334980542624206975339984227011834211817390282147087590558360949377877770204187551021230068873669359912676460843328864437839776800208903243375535822415776551028721958007983202221252526435232142739789134615995463161445638915626812524023407810542480445970940565188746269379591869263267691901882347406884303133591362800303409822957955491038042165172852986311070696379981212959058853596599650869822157249909745725492650638316799826554389312528226190539051792542641455215303276974352248854204664238794410243683170459566603353851721633059179853256825003163430729918043900877336576495509071177707047439680861793411200590338187746053925309531543333277366833114293307504715541259502817964716977219343522490498109580619163337671863091241607668808810778866307910006386949766976334774178263849812654415636427472138520285264738528465494636784064855863740929314905817186894770093539454660415280219547661591125066412821841590506363857066781136504908827034442419748900103097579509953651901860935555711926747489740781052746673839338958148688812912465817581226497167114279625378960116829879600543931649193000313948592894126848107631978346929637256525334803958784512178391055323417008508086869669126401165782988602604502115494193750144188639870278322771055255158716356209766978714108545067373345809810666017349219035312010660188971538150056068610081322137343712184439387050305649908433701575482451149859333071181052444987778204343262427390224754835871169763006407865571160173152686802424105030599711150053383615472775073736276563132741320539269348384867302705137465888561395013566999234596681559678267054522442905541106592813996834239459470602754124530801453159828505872258962670213027367314450065207408309384156576011151495406762120723049234326522993835763371257895588591507984204685933266451986388947342388163790471938022710859624847607822077531138370498972245013903236144058776877160197360872838082126525086714822905845502426288263598505015736516942886885815408131895133160050055585237128074225011531016827193083813830485338583554636412806090992470143845115095253104696852493973483679332134042074835038263191508999326850125243942187081416025436624075681138426191305889094535343552593587941775247088328895748942220237320271115580556374939804093100387778438749921864621051364316337760363848819386434923686006069431939449858987758814963527389752879329757226949766823775787660549835335831589039654014324369458047157243215657220925367708478670440261230772215977909515916655387905722440456017170016926181355158504203683301627519713482151349829465708649114080978858448793239425674433463859016018232309003248320398624848171496899589070413422690033952672826446779216058583664564741637719608639093966308811270648813314558405430839806188644883344575112033751700513466180941449830717346977670222710981972365532335996623052187790151571664489771862874174713941131153841492622078894824083597821714591234582813432476996764564761268948036934444127935081089483670085553590020220418875678575877265209117903004411221504841151855264536976873149937526188960927354116269101785818031898378153060075095243661821748187840643054553704166997145727727980711571771413713304468774661981691331262137550821924453653985284205432333401534704270817202935052552736092037213814533688998978598240006098136714313732939577460512860109632450957929127304214509610568211266596156412670252040454758401777899125986379721528592638664624721245081719196625392016857103742992425096286388339068251579229449229852574674968989123268739724092506745605267713461593889222473502855423722612079395652553489481546845216155264244626713674206360702307580138638389449740044119709247546181532093662614220717520414972751030389370324715080173359489638780689822407932169866169866316784644043150780713480670313766151126533213225384416640008898688372438191338572292282743861284722869066397361344635637359146396802154810569631580800380910810291319809498931465102378585252121056441140413577124880662314925305321284767140841890336346895761414266084699832372520382680876507755738666583199545964533912312573845289424448962685656148965137576313622620683672959071445179672708358548946944389654668912256883729557576045329589771247488151681990929776395342884851125569804170741423405950851646991991099923688258317395387297429099104093864594711590167262112160863508850811194538578647383728712876675245564419893427078047838473321284680798775328555429620301595627154133662165444864286575674408735441042669764412562714690700209809975415498752316639925244094962644777319273150742781351751493383243143880584923416913827292293791492001914288175774291225759575964700606074254860618078380541051484776314362150541036581247334657304818270113867610391462896566632078302876850565541320966662050238400754074817318394300017823778695544283399188619883328137164813165992071481391582256261065687846982875114611058366018130372993319168714123988188971168936059081229723507837807444688366273134578279963765409468055764832542739067507043731695476503793897990093246781071677739780085644352373826208493468579750331131316195693937952644234437727129640809427950428479233369251249569101641625\n		0.024	2026-02-16 11:43:30.264033
304	3	\N	num = int(input())\n\nprint(num**3)	71	ACCEPTED			0.021	2026-02-16 11:43:34.763262
404	3	\N	print("Hello World 390")	71	ERROR	Hello World 390\n	Error on Test Case 1	0	2026-02-18 11:29:25.105509
302	3	\N	num = int(input())\n\nprint(num**3)	71	ACCEPTED	599285100440669477209323595924238145077558477338353728233859810219760159471663293021705502156441148956359942480508598683474581001073727276125309854475627694469382387434571090577569308538161821425317501562927210347104525670650023896671800621257564349196969677238189357857424469950958852141134649199139587062366577135863617664417431048559135386465400942599266542885084773643529615754089100139763491273134578279963765409468055764832542739067507043731695476503793897990093246781071677739780085644352373826208493468579750331131316195693937952644234437727129640809427950428479233369251249569101641625\n		0.021	2026-02-16 11:43:21.660622
305	3	\N	num1,num2 = map(int,input().split())\n\nprint(num1+num2)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num1,num2 = map(int,input().split())\nValueError: not enough values to unpack (expected 2, got 1)\n	0.021	2026-02-16 11:44:06.825702
321	1	\N	age = int(input())\nif age>= 18:\n    print("Eligible")\nelse:\n    print("Not Eligible")	71	ACCEPTED			0.022	2026-02-18 10:59:57.76128
306	3	\N	num1,num2 = map(int,input().split())\n\nprint(num1+num2)	71	ACCEPTED	3\n		0.021	2026-02-16 11:44:12.053792
307	3	\N	num1,num2 = map(int,input().split())\n\nprint(num1+num2)	71	ACCEPTED	-9850\n		0.02	2026-02-16 11:44:19.624708
329	3	\N	n=int(input())\nif(n>=18)print("Eligible")\nelse print("Not Eligible")	71	ERROR		  File "script.py", line 2\n    if(n>=18)print("Eligible")\n             ^\nSyntaxError: invalid syntax\n	0.026	2026-02-18 11:05:34.273484
308	3	\N	num1,num2 = map(int,input().split())\n\nprint(num1+num2)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    num1,num2 = map(int,input().split())\nValueError: not enough values to unpack (expected 2, got 1)\n	0	2026-02-16 11:44:20.847892
322	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.01	2026-02-18 11:03:40.608502
309	3	\N	# num1,num2 = map(int,input().split())\nnum1 = int(input())\nnum2 = int(input())\nprint(num1+num2)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    num1 = int(input())\nValueError: invalid literal for int() with base 10: '-9873 23'\n	0.021	2026-02-16 11:44:51.267654
310	3	\N	# num1,num2 = map(int,input().split())\nnum1 = int(input())\nnum2 = int(input())\nprint(num1+num2)	71	ACCEPTED			0.022	2026-02-16 11:44:51.871539
311	3	\N	\nn = int(input())\nprint(n*(n+1))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    n = int(input())\nValueError: invalid literal for int() with base 10: '-9873 23'\n	0.02	2026-02-16 11:45:27.822432
323	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.012	2026-02-18 11:03:40.905287
312	3	\N	\nn = int(input())\nprint(n*(n+1))	71	ERROR	30\n	Error on Test Case 1	0	2026-02-16 11:45:29.554732
313	3	\N	\nn = int(input())\nprint(n*(n+1)//2)	71	ACCEPTED			0.023	2026-02-16 11:45:33.756346
333	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    N = input()\nEOFError: EOF when reading a line\n	0.022	2026-02-18 11:07:36.740512
314	3	\N	n = int(input())\n\nprint(sum(list(map(int,input().split()))))	71	ERROR	1\n	Error on Test Case 1	0	2026-02-16 11:46:07.043955
324	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.021	2026-02-18 11:03:41.213072
315	3	\N	n = int(input())\nres = 0\nfor i in range(n):\n    res += int(input())\nprint(res)\n# print(sum(list(map(int,input().split()))))	71	ACCEPTED			0.021	2026-02-16 11:46:35.819861
316	3	\N	print('Eligible' if int(input()) >= 18 else "Not Eligible")	71	ACCEPTED			0.022	2026-02-16 11:47:04.184034
330	3	\N	n=int(input())\nif(n>=18):print("Eligible")\nelse: print("Not Eligible")	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    n=int(input())\nEOFError: EOF when reading a line\n	0.023	2026-02-18 11:05:44.52077
317	3	\N	n  = int(input())\n\nprint(*[i for i in range(1,n+1)])	71	ACCEPTED			0.022	2026-02-16 11:47:28.043008
325	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-18 11:03:41.622381
318	1	\N	print("Heloo")	71	ACCEPTED	Heloo\n		0.033	2026-02-18 10:58:46.306346
319	1	\N	print("Heloo")	71	ERROR	Heloo\n	Error on Test Case 1	0	2026-02-18 10:58:52.505783
320	1	\N	print("Eligible")	71	ERROR	Eligible\n	Error on Test Case 2	0.022	2026-02-18 10:59:06.326205
326	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-18 11:03:53.309639
327	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-18 11:03:54.176061
331	3	\N	n=int(input())\nif(n>=18):print("Eligible")\nelse: print("Not Eligible")	71	ACCEPTED	Eligible\n		0.021	2026-02-18 11:05:51.679749
328	3	\N	l=int(input())\nb=int(input())\nprint(l*b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    l=int(input())\nEOFError: EOF when reading a line\n	0.021	2026-02-18 11:03:55.03748
336	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    N = input()\nEOFError: EOF when reading a line\n	0.024	2026-02-18 11:07:40.975317
332	3	\N	n=int(input())\nif(n>=18):print("Eligible")\nelse: print("Not Eligible")	71	ACCEPTED			0.024	2026-02-18 11:05:54.049938
334	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    N = input()\nEOFError: EOF when reading a line\n	0.017	2026-02-18 11:07:38.294693
335	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    N = input()\nEOFError: EOF when reading a line\n	0.021	2026-02-18 11:07:39.283344
337	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    print(n)\nNameError: name 'n' is not defined\n	0	2026-02-18 11:07:49.583725
338	3	\N	N = input()\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 2, in <module>\n    print(n)\nNameError: name 'n' is not defined\n	0	2026-02-18 11:07:51.224534
339	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:07:56.47906
340	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:07:57.863638
341	3	\N	n=int(input())	71	ERROR		Error on Test Case 1	0	2026-02-18 11:07:59.794529
347	3	\N	n=int(input())\nprint(n)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    n=int(input())\nEOFError: EOF when reading a line\n	0.021	2026-02-18 11:08:11.251774
381	3	\N	print("Hello World 22")	71	ERROR	Hello World 22\n	Error on Test Case 1	0	2026-02-18 11:29:21.201184
348	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:18.52799
369	3	\N	print(input()[::-1])	71	ACCEPTED			0.024	2026-02-18 11:19:24.458333
349	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:19.416509
350	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:20.044388
351	3	\N	n = input()\nprint(n)	71	ERROR	4\n	Error on Test Case 1	0	2026-02-18 11:08:20.427872
370	3	\N	n = int(input())\nif n  == 0:\n    print("Zero")\nelif n>0 :\n    print("Positive")\nelse:\n    print("Negative")	71	ACCEPTED	Positive\n		0.023	2026-02-18 11:22:08.71112
352	3	\N	print(*[i for i in range(1,int(input()))])	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(*[i for i in range(1,int(input()))])\nEOFError: EOF when reading a line\n	0.021	2026-02-18 11:09:28.580563
353	3	\N	print(*[i for i in range(1,int(input()))])	71	ERROR	1 2 3 4\n	Error on Test Case 1	0	2026-02-18 11:09:31.259869
393	3	\N	print("Hello World 213")	71	ERROR	Hello World 213\n	Error on Test Case 1	0	2026-02-18 11:29:23.25117
354	3	\N	print(*[i for i in range(1,int(input()))])	71	ACCEPTED	1 2 3 4\n		0.023	2026-02-18 11:09:45.352112
371	3	\N	n = int(input())\nif n  == 0:\n    print("Zero")\nelif n>0 :\n    print("Positive")\nelse:\n    print("Negative")	71	ACCEPTED			0.026	2026-02-18 11:22:10.07157
355	3	\N	print(*[i for i in range(1,int(input())+1)])	71	ACCEPTED			0.025	2026-02-18 11:09:53.597531
356	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-18 11:10:06.765474
382	3	\N	print("Hello World 37")	71	ERROR	Hello World 37\n	Error on Test Case 1	0	2026-02-18 11:29:21.362355
357	3	\N	print("hello")	71	ERROR	hello\n	Error on Test Case 1	0	2026-02-18 11:10:15.649782
372	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-18 11:28:56.112377
358	3	\N	print("hello")	71	ACCEPTED	hello\n		0.024	2026-02-18 11:10:17.40287
359	3	\N	print("hello")	71	ERROR	hello\n	Error on Test Case 1	0	2026-02-18 11:10:19.246001
360	3	\N	if int(input()) %5 ==0:\n    print("Yes")\nelse:\n    print("No")	71	ACCEPTED			0.023	2026-02-18 11:12:41.221496
373	3	\N	print("Hello World 1")	71	ERROR	Hello World 1\n	Error on Test Case 1	0	2026-02-18 11:28:56.891366
361	3	\N	a=int(input())\nb=int(input())\nprint(a+b)	71	ACCEPTED			0.023	2026-02-18 11:16:32.626588
362	3	\N	print(sum(list(map(int,input().split()))))	71	ACCEPTED	7\n		0.027	2026-02-18 11:17:00.589296
389	3	\N	print("Hello World 149")	71	ERROR	Hello World 149\n	Error on Test Case 1	0	2026-02-18 11:29:22.558191
363	3	\N	print(sum(list(map(int,input().split()))))	71	ERROR	3\n	Error on Test Case 1	0	2026-02-18 11:17:02.139145
374	3	\N	print("Hello World 2")	71	ERROR	Hello World 2\n	Error on Test Case 1	0	2026-02-18 11:28:57.692203
364	3	\N	print(sum(int(input())+int(input())))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(sum(int(input())+int(input())))\nValueError: invalid literal for int() with base 10: '5 2 4'\n	0.023	2026-02-18 11:18:21.102565
365	3	\N	print(sum(int(input())+int(input())))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(sum(int(input())+int(input())))\nTypeError: 'int' object is not iterable\n	0.021	2026-02-18 11:18:28.774443
383	3	\N	print("Hello World 50")	71	ERROR	Hello World 50\n	Error on Test Case 1	0	2026-02-18 11:29:21.502463
366	3	\N	print(int(input())+int(input()))	71	ACCEPTED	7\n		0.028	2026-02-18 11:18:38.414409
375	3	\N	print("Hello World 3")	71	ERROR	Hello World 3\n	Error on Test Case 1	0	2026-02-18 11:28:58.498538
367	3	\N	print(int(input())+int(input()))	71	ACCEPTED			0.024	2026-02-18 11:18:39.64703
368	3	\N	print(input()[::-1])	71	ACCEPTED	5\n		0.021	2026-02-18 11:19:17.193385
376	3	\N	print("Hello World 4")	71	ERROR	Hello World 4\n	Error on Test Case 1	0	2026-02-18 11:28:59.297733
377	3	\N	print("Hello World 5")	71	ERROR	Hello World 5\n	Error on Test Case 1	0	2026-02-18 11:29:00.102794
384	3	\N	print("Hello World 66")	71	ERROR	Hello World 66\n	Error on Test Case 1	0	2026-02-18 11:29:21.676599
378	3	\N	print("Hello World 6")	71	ERROR	Hello World 6\n	Error on Test Case 1	0	2026-02-18 11:29:00.903187
379	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-18 11:29:20.956675
380	3	\N	print("Hello World 5")	71	ERROR	Hello World 5\n	Error on Test Case 1	0	2026-02-18 11:29:21.010733
390	3	\N	print("Hello World 165")	71	ERROR	Hello World 165\n	Error on Test Case 1	0	2026-02-18 11:29:22.736089
385	3	\N	print("Hello World 80")	71	ERROR	Hello World 80\n	Error on Test Case 1	0	2026-02-18 11:29:21.813489
386	3	\N	print("Hello World 97")	71	ERROR	Hello World 97\n	Error on Test Case 1	0	2026-02-18 11:29:21.996301
397	3	\N	print("Hello World 273")	71	ERROR	Hello World 273\n	Error on Test Case 1	0	2026-02-18 11:29:23.876163
387	3	\N	print("Hello World 113")	71	ERROR	Hello World 113\n	Error on Test Case 1	0	2026-02-18 11:29:22.172771
391	3	\N	print("Hello World 179")	71	ERROR	Hello World 179\n	Error on Test Case 1	0	2026-02-18 11:29:22.884541
388	3	\N	print("Hello World 132")	71	ERROR	Hello World 132\n	Error on Test Case 1	0	2026-02-18 11:29:22.379776
394	3	\N	print("Hello World 228")	71	ERROR	Hello World 228\n	Error on Test Case 1	0	2026-02-18 11:29:23.412311
392	3	\N	print("Hello World 196")	71	ERROR	Hello World 196\n	Error on Test Case 1	0	2026-02-18 11:29:23.068459
396	3	\N	print("Hello World 257")	71	ERROR	Hello World 257\n	Error on Test Case 1	0	2026-02-18 11:29:23.711616
395	3	\N	print("Hello World 242")	71	ERROR	Hello World 242\n	Error on Test Case 1	0	2026-02-18 11:29:23.556894
398	3	\N	print("Hello World 289")	71	ERROR	Hello World 289\n	Error on Test Case 1	0	2026-02-18 11:29:24.049669
399	3	\N	print("Hello World 306")	71	ERROR	Hello World 306\n	Error on Test Case 1	0	2026-02-18 11:29:24.220992
400	3	\N	print("Hello World 323")	71	ERROR	Hello World 323\n	Error on Test Case 1	0	2026-02-18 11:29:24.398061
401	3	\N	print("Hello World 340")	71	ERROR	Hello World 340\n	Error on Test Case 1	0	2026-02-18 11:29:24.58214
402	3	\N	print("Hello World 355")	71	ERROR	Hello World 355\n	Error on Test Case 1	0	2026-02-18 11:29:24.736386
403	3	\N	print("Hello World 372")	71	ERROR	Hello World 372\n	Error on Test Case 1	0	2026-02-18 11:29:24.916343
405	3	\N	print("Hello World 407")	71	ERROR	Hello World 407\n	Error on Test Case 1	0	2026-02-18 11:29:25.289294
406	3	\N	print("Hello World 423")	71	ERROR	Hello World 423\n	Error on Test Case 1	0	2026-02-18 11:29:25.458995
407	3	\N	print("Hello World 437")	71	ERROR	Hello World 437\n	Error on Test Case 1	0	2026-02-18 11:29:25.603948
408	3	\N	print("Hello World 452")	71	ERROR	Hello World 452\n	Error on Test Case 1	0	2026-02-18 11:29:25.761749
409	3	\N	print("Hello World 468")	71	ERROR	Hello World 468\n	Error on Test Case 1	0	2026-02-18 11:29:25.937478
410	3	\N	print("Hello World 484")	71	ERROR	Hello World 484\n	Error on Test Case 1	0	2026-02-18 11:29:26.109103
411	3	\N	print("Hello World 503")	71	ERROR	Hello World 503\n	Error on Test Case 1	0	2026-02-18 11:29:26.305769
412	3	\N	print("Hello World 522")	71	ERROR	Hello World 522\n	Error on Test Case 1	0	2026-02-18 11:29:26.510315
413	3	\N	print("Hello World 539")	71	ERROR	Hello World 539\n	Error on Test Case 1	0	2026-02-18 11:29:26.700869
414	3	\N	print("Hello World 557")	71	ERROR	Hello World 557\n	Error on Test Case 1	0	2026-02-18 11:29:26.889127
415	3	\N	print("Hello World 574")	71	ERROR	Hello World 574\n	Error on Test Case 1	0	2026-02-18 11:29:27.079302
416	3	\N	print("Hello World 590")	71	ERROR	Hello World 590\n	Error on Test Case 1	0	2026-02-18 11:29:27.259726
417	3	\N	print("Hello World 607")	71	ERROR	Hello World 607\n	Error on Test Case 1	0	2026-02-18 11:29:27.448201
418	3	\N	print("Hello World 622")	71	ERROR	Hello World 622\n	Error on Test Case 1	0	2026-02-18 11:29:27.602087
419	3	\N	print("Hello World 638")	71	ERROR	Hello World 638\n	Error on Test Case 1	0	2026-02-18 11:29:27.770999
420	3	\N	print("Hello World 653")	71	ERROR	Hello World 653\n	Error on Test Case 1	0	2026-02-18 11:29:27.932339
421	3	\N	print("Hello World 667")	71	ERROR	Hello World 667\n	Error on Test Case 1	0	2026-02-18 11:29:28.085961
422	3	\N	print("Hello World 685")	71	ERROR	Hello World 685\n	Error on Test Case 1	0	2026-02-18 11:29:28.271644
423	3	\N	print("Hello World 702")	71	ERROR	Hello World 702\n	Error on Test Case 1	0	2026-02-18 11:29:28.456912
424	3	\N	print("Hello World 719")	71	ERROR	Hello World 719\n	Error on Test Case 1	0	2026-02-18 11:29:28.638556
425	3	\N	print("Hello World 738")	71	ERROR	Hello World 738\n	Error on Test Case 1	0	2026-02-18 11:29:28.835099
426	3	\N	print("Hello World 753")	71	ERROR	Hello World 753\n	Error on Test Case 1	0	2026-02-18 11:29:28.994427
427	3	\N	print("Hello World 768")	71	ERROR	Hello World 768\n	Error on Test Case 1	0	2026-02-18 11:29:29.154554
428	3	\N	print("Hello World 783")	71	ERROR	Hello World 783\n	Error on Test Case 1	0	2026-02-18 11:29:29.307932
429	3	\N	print("Hello World 800")	71	ERROR	Hello World 800\n	Error on Test Case 1	0	2026-02-18 11:29:29.492233
430	3	\N	print("Hello World 819")	71	ERROR	Hello World 819\n	Error on Test Case 1	0	2026-02-18 11:29:29.696513
431	3	\N	print("Hello World 835")	71	ERROR	Hello World 835\n	Error on Test Case 1	0	2026-02-18 11:29:29.863644
432	3	\N	print("Hello World 849")	71	ERROR	Hello World 849\n	Error on Test Case 1	0	2026-02-18 11:29:30.018135
433	3	\N	print("Hello World 865")	71	ERROR	Hello World 865\n	Error on Test Case 1	0	2026-02-18 11:29:30.183529
434	3	\N	print("Hello World 880")	71	ERROR	Hello World 880\n	Error on Test Case 1	0	2026-02-18 11:29:30.340521
435	3	\N	print("Hello World 896")	71	ERROR	Hello World 896\n	Error on Test Case 1	0	2026-02-18 11:29:30.514177
436	3	\N	print("Hello World 913")	71	ERROR	Hello World 913\n	Error on Test Case 1	0	2026-02-18 11:29:30.697701
473	3	\N	print("Hello World 1510")	71	ERROR	Hello World 1510\n	Error on Test Case 1	0	2026-02-18 11:29:37.007301
437	3	\N	print("Hello World 928")	71	ERROR	Hello World 928\n	Error on Test Case 1	0	2026-02-18 11:29:30.849083
460	3	\N	print("Hello World 1300")	71	ERROR	Hello World 1300\n	Error on Test Case 1	0	2026-02-18 11:29:34.793522
438	3	\N	print("Hello World 943")	71	ERROR	Hello World 943\n	Error on Test Case 1	0	2026-02-18 11:29:31.012295
439	3	\N	print("Hello World 960")	71	ERROR	Hello World 960\n	Error on Test Case 1	0	2026-02-18 11:29:31.186927
440	3	\N	print("Hello World 974")	71	ERROR	Hello World 974\n	Error on Test Case 1	0	2026-02-18 11:29:31.328613
461	3	\N	print("Hello World 1315")	71	ERROR	Hello World 1315\n	Error on Test Case 1	0	2026-02-18 11:29:34.958083
441	3	\N	print("Hello World 990")	71	ERROR	Hello World 990\n	Error on Test Case 1	0	2026-02-18 11:29:31.498735
442	3	\N	print("Hello World 1005")	71	ERROR	Hello World 1005\n	Error on Test Case 1	0	2026-02-18 11:29:31.656404
485	3	\N	print("Hello World 1703")	71	ERROR	Hello World 1703\n	Error on Test Case 1	0	2026-02-18 11:29:39.024856
443	3	\N	print("Hello World 1020")	71	ERROR	Hello World 1020\n	Error on Test Case 1	0	2026-02-18 11:29:31.814799
462	3	\N	print("Hello World 1331")	71	ERROR	Hello World 1331\n	Error on Test Case 1	0	2026-02-18 11:29:35.118633
444	3	\N	print("Hello World 1037")	71	ERROR	Hello World 1037\n	Error on Test Case 1	0	2026-02-18 11:29:31.99867
445	3	\N	print("Hello World 1054")	71	ERROR	Hello World 1054\n	Error on Test Case 1	0	2026-02-18 11:29:32.184968
474	3	\N	print("Hello World 1526")	71	ERROR	Hello World 1526\n	Error on Test Case 1	0	2026-02-18 11:29:37.167278
446	3	\N	print("Hello World 1070")	71	ERROR	Hello World 1070\n	Error on Test Case 1	0	2026-02-18 11:29:32.355595
463	3	\N	print("Hello World 1346")	71	ERROR	Hello World 1346\n	Error on Test Case 1	0	2026-02-18 11:29:35.273542
447	3	\N	print("Hello World 1087")	71	ERROR	Hello World 1087\n	Error on Test Case 1	0	2026-02-18 11:29:32.528366
448	3	\N	print("Hello World 1103")	71	ERROR	Hello World 1103\n	Error on Test Case 1	0	2026-02-18 11:29:32.705137
449	3	\N	print("Hello World 1120")	71	ERROR	Hello World 1120\n	Error on Test Case 1	0	2026-02-18 11:29:32.884807
464	3	\N	print("Hello World 1361")	71	ERROR	Hello World 1361\n	Error on Test Case 1	0	2026-02-18 11:29:35.430106
450	3	\N	print("Hello World 1138")	71	ERROR	Hello World 1138\n	Error on Test Case 1	0	2026-02-18 11:29:33.077247
451	3	\N	print("Hello World 1155")	71	ERROR	Hello World 1155\n	Error on Test Case 1	0	2026-02-18 11:29:33.259382
481	3	\N	print("Hello World 1635")	71	ERROR	Hello World 1635\n	Error on Test Case 1	0	2026-02-18 11:29:38.310537
452	3	\N	print("Hello World 1172")	71	ERROR	Hello World 1172\n	Error on Test Case 1	0	2026-02-18 11:29:33.445938
465	3	\N	print("Hello World 1379")	71	ERROR	Hello World 1379\n	Error on Test Case 1	0	2026-02-18 11:29:35.624525
453	3	\N	print("Hello World 1189")	71	ERROR	Hello World 1189\n	Error on Test Case 1	0	2026-02-18 11:29:33.624746
454	3	\N	print("Hello World 1205")	71	ERROR	Hello World 1205\n	Error on Test Case 1	0	2026-02-18 11:29:33.791459
475	3	\N	print("Hello World 1542")	71	ERROR	Hello World 1542\n	Error on Test Case 1	0	2026-02-18 11:29:37.340341
455	3	\N	print("Hello World 1220")	71	ERROR	Hello World 1220\n	Error on Test Case 1	0	2026-02-18 11:29:33.95554
466	3	\N	print("Hello World 1394")	71	ERROR	Hello World 1394\n	Error on Test Case 1	0	2026-02-18 11:29:35.779335
456	3	\N	print("Hello World 1236")	71	ERROR	Hello World 1236\n	Error on Test Case 1	0	2026-02-18 11:29:34.112574
457	3	\N	print("Hello World 1251")	71	ERROR	Hello World 1251\n	Error on Test Case 1	0	2026-02-18 11:29:34.27529
458	3	\N	print("Hello World 1269")	71	ERROR	Hello World 1269\n	Error on Test Case 1	0	2026-02-18 11:29:34.469046
467	3	\N	print("Hello World 1412")	71	ERROR	Hello World 1412\n	Error on Test Case 1	0	2026-02-18 11:29:35.973008
459	3	\N	print("Hello World 1282")	71	ERROR	Hello World 1282\n	Error on Test Case 1	0	2026-02-18 11:29:34.603187
468	3	\N	print("Hello World 1430")	71	ERROR	Hello World 1430\n	Error on Test Case 1	0	2026-02-18 11:29:36.167956
476	3	\N	print("Hello World 1560")	71	ERROR	Hello World 1560\n	Error on Test Case 1	0	2026-02-18 11:29:37.52414
469	3	\N	print("Hello World 1446")	71	ERROR	Hello World 1446\n	Error on Test Case 1	0	2026-02-18 11:29:36.342297
470	3	\N	print("Hello World 1463")	71	ERROR	Hello World 1463\n	Error on Test Case 1	0	2026-02-18 11:29:36.512948
471	3	\N	print("Hello World 1481")	71	ERROR	Hello World 1481\n	Error on Test Case 1	0	2026-02-18 11:29:36.695784
477	3	\N	print("Hello World 1574")	71	ERROR	Hello World 1574\n	Error on Test Case 1	0	2026-02-18 11:29:37.667834
472	3	\N	print("Hello World 1495")	71	ERROR	Hello World 1495\n	Error on Test Case 1	0	2026-02-18 11:29:36.8434
482	3	\N	print("Hello World 1650")	71	ERROR	Hello World 1650\n	Error on Test Case 1	0	2026-02-18 11:29:38.470141
478	3	\N	print("Hello World 1587")	71	ERROR	Hello World 1587\n	Error on Test Case 1	0	2026-02-18 11:29:37.799105
489	3	\N	print("Hello World 1774")	71	ERROR	Hello World 1774\n	Error on Test Case 1	0	2026-02-18 11:29:39.772126
479	3	\N	print("Hello World 1603")	71	ERROR	Hello World 1603\n	Error on Test Case 1	0	2026-02-18 11:29:37.972282
483	3	\N	print("Hello World 1665")	71	ERROR	Hello World 1665\n	Error on Test Case 1	0	2026-02-18 11:29:38.64331
480	3	\N	print("Hello World 1619")	71	ERROR	Hello World 1619\n	Error on Test Case 1	0	2026-02-18 11:29:38.153804
486	3	\N	print("Hello World 1721")	71	ERROR	Hello World 1721\n	Error on Test Case 1	0	2026-02-18 11:29:39.215017
484	3	\N	print("Hello World 1685")	71	ERROR	Hello World 1685\n	Error on Test Case 1	0	2026-02-18 11:29:38.836388
488	3	\N	print("Hello World 1755")	71	ERROR	Hello World 1755\n	Error on Test Case 1	0	2026-02-18 11:29:39.568326
487	3	\N	print("Hello World 1738")	71	ERROR	Hello World 1738\n	Error on Test Case 1	0	2026-02-18 11:29:39.387134
490	3	\N	print("Hello World 1792")	71	ERROR	Hello World 1792\n	Error on Test Case 1	0	2026-02-18 11:29:39.972992
491	3	\N	print("Hello World 1811")	71	ERROR	Hello World 1811\n	Error on Test Case 1	0	2026-02-18 11:29:40.181463
492	3	\N	print("Hello World 1826")	71	ERROR	Hello World 1826\n	Error on Test Case 1	0	2026-02-18 11:29:40.33483
493	3	\N	print("Hello World 1842")	71	ERROR	Hello World 1842\n	Error on Test Case 1	0	2026-02-18 11:29:40.50779
494	3	\N	print("Hello World 1856")	71	ERROR	Hello World 1856\n	Error on Test Case 1	0	2026-02-18 11:29:40.65412
495	3	\N	print("Hello World 1869")	71	ERROR	Hello World 1869\n	Error on Test Case 1	0	2026-02-18 11:29:40.790046
532	3	\N	print("Hello World 2481")	71	ERROR	Hello World 2481\n	Error on Test Case 1	0	2026-02-18 11:29:47.296469
496	3	\N	print("Hello World 1887")	71	ERROR	Hello World 1887\n	Error on Test Case 1	0	2026-02-18 11:29:40.983375
519	3	\N	print("Hello World 2262")	71	ERROR	Hello World 2262\n	Error on Test Case 1	0	2026-02-18 11:29:44.982515
497	3	\N	print("Hello World 1902")	71	ERROR	Hello World 1902\n	Error on Test Case 1	0	2026-02-18 11:29:41.161778
498	3	\N	print("Hello World 1920")	71	ERROR	Hello World 1920\n	Error on Test Case 1	0	2026-02-18 11:29:41.340151
499	3	\N	print("Hello World 1936")	71	ERROR	Hello World 1936\n	Error on Test Case 1	0	2026-02-18 11:29:41.509795
520	3	\N	print("Hello World 2278")	71	ERROR	Hello World 2278\n	Error on Test Case 1	0	2026-02-18 11:29:45.14498
500	3	\N	print("Hello World 1951")	71	ERROR	Hello World 1951\n	Error on Test Case 1	0	2026-02-18 11:29:41.666165
501	3	\N	print("Hello World 1969")	71	ERROR	Hello World 1969\n	Error on Test Case 1	0	2026-02-18 11:29:41.860239
544	3	\N	print("Hello World 2671")	71	ERROR	Hello World 2671\n	Error on Test Case 1	0	2026-02-18 11:29:49.298329
502	3	\N	print("Hello World 1985")	71	ERROR	Hello World 1985\n	Error on Test Case 1	0	2026-02-18 11:29:42.03112
521	3	\N	print("Hello World 2294")	71	ERROR	Hello World 2294\n	Error on Test Case 1	0	2026-02-18 11:29:45.324174
503	3	\N	print("Hello World 2003")	71	ERROR	Hello World 2003\n	Error on Test Case 1	0	2026-02-18 11:29:42.219107
504	3	\N	print("Hello World 2019")	71	ERROR	Hello World 2019\n	Error on Test Case 1	0	2026-02-18 11:29:42.387461
533	3	\N	print("Hello World 2496")	71	ERROR	Hello World 2496\n	Error on Test Case 1	0	2026-02-18 11:29:47.451463
505	3	\N	print("Hello World 2036")	71	ERROR	Hello World 2036\n	Error on Test Case 1	0	2026-02-18 11:29:42.567696
522	3	\N	print("Hello World 2313")	71	ERROR	Hello World 2313\n	Error on Test Case 1	0	2026-02-18 11:29:45.530258
506	3	\N	print("Hello World 2049")	71	ERROR	Hello World 2049\n	Error on Test Case 1	0	2026-02-18 11:29:42.705801
507	3	\N	print("Hello World 2062")	71	ERROR	Hello World 2062\n	Error on Test Case 1	0	2026-02-18 11:29:42.842948
508	3	\N	print("Hello World 2082")	71	ERROR	Hello World 2082\n	Error on Test Case 1	0	2026-02-18 11:29:43.04864
523	3	\N	print("Hello World 2332")	71	ERROR	Hello World 2332\n	Error on Test Case 1	0	2026-02-18 11:29:45.733206
509	3	\N	print("Hello World 2099")	71	ERROR	Hello World 2099\n	Error on Test Case 1	0	2026-02-18 11:29:43.244038
510	3	\N	print("Hello World 2115")	71	ERROR	Hello World 2115\n	Error on Test Case 1	0	2026-02-18 11:29:43.414472
540	3	\N	print("Hello World 2602")	71	ERROR	Hello World 2602\n	Error on Test Case 1	0	2026-02-18 11:29:48.569899
511	3	\N	print("Hello World 2133")	71	ERROR	Hello World 2133\n	Error on Test Case 1	0	2026-02-18 11:29:43.600774
524	3	\N	print("Hello World 2351")	71	ERROR	Hello World 2351\n	Error on Test Case 1	0	2026-02-18 11:29:45.934166
512	3	\N	print("Hello World 2151")	71	ERROR	Hello World 2151\n	Error on Test Case 1	0	2026-02-18 11:29:43.792857
513	3	\N	print("Hello World 2168")	71	ERROR	Hello World 2168\n	Error on Test Case 1	0	2026-02-18 11:29:43.970646
534	3	\N	print("Hello World 2509")	71	ERROR	Hello World 2509\n	Error on Test Case 1	0	2026-02-18 11:29:47.586108
514	3	\N	print("Hello World 2184")	71	ERROR	Hello World 2184\n	Error on Test Case 1	0	2026-02-18 11:29:44.143066
525	3	\N	print("Hello World 2369")	71	ERROR	Hello World 2369\n	Error on Test Case 1	0	2026-02-18 11:29:46.115196
515	3	\N	print("Hello World 2198")	71	ERROR	Hello World 2198\n	Error on Test Case 1	0	2026-02-18 11:29:44.289778
516	3	\N	print("Hello World 2215")	71	ERROR	Hello World 2215\n	Error on Test Case 1	0	2026-02-18 11:29:44.469703
517	3	\N	print("Hello World 2230")	71	ERROR	Hello World 2230\n	Error on Test Case 1	0	2026-02-18 11:29:44.630983
526	3	\N	print("Hello World 2383")	71	ERROR	Hello World 2383\n	Error on Test Case 1	0	2026-02-18 11:29:46.264667
518	3	\N	print("Hello World 2244")	71	ERROR	Hello World 2244\n	Error on Test Case 1	0	2026-02-18 11:29:44.804861
527	3	\N	print("Hello World 2400")	71	ERROR	Hello World 2400\n	Error on Test Case 1	0	2026-02-18 11:29:46.440421
535	3	\N	print("Hello World 2524")	71	ERROR	Hello World 2524\n	Error on Test Case 1	0	2026-02-18 11:29:47.746234
528	3	\N	print("Hello World 2415")	71	ERROR	Hello World 2415\n	Error on Test Case 1	0	2026-02-18 11:29:46.60053
529	3	\N	print("Hello World 2431")	71	ERROR	Hello World 2431\n	Error on Test Case 1	0	2026-02-18 11:29:46.764623
530	3	\N	print("Hello World 2448")	71	ERROR	Hello World 2448\n	Error on Test Case 1	0	2026-02-18 11:29:46.953302
536	3	\N	print("Hello World 2541")	71	ERROR	Hello World 2541\n	Error on Test Case 1	0	2026-02-18 11:29:47.926582
531	3	\N	print("Hello World 2466")	71	ERROR	Hello World 2466\n	Error on Test Case 1	0	2026-02-18 11:29:47.136454
541	3	\N	print("Hello World 2619")	71	ERROR	Hello World 2619\n	Error on Test Case 1	0	2026-02-18 11:29:48.742724
537	3	\N	print("Hello World 2558")	71	ERROR	Hello World 2558\n	Error on Test Case 1	0	2026-02-18 11:29:48.107517
548	3	\N	print("Hello World 2739")	71	ERROR	Hello World 2739\n	Error on Test Case 1	0	2026-02-18 11:29:50.047166
538	3	\N	print("Hello World 2573")	71	ERROR	Hello World 2573\n	Error on Test Case 1	0	2026-02-18 11:29:48.263127
542	3	\N	print("Hello World 2637")	71	ERROR	Hello World 2637\n	Error on Test Case 1	0	2026-02-18 11:29:48.940472
539	3	\N	print("Hello World 2588")	71	ERROR	Hello World 2588\n	Error on Test Case 1	0	2026-02-18 11:29:48.420795
545	3	\N	print("Hello World 2687")	71	ERROR	Hello World 2687\n	Error on Test Case 1	0	2026-02-18 11:29:49.478677
543	3	\N	print("Hello World 2655")	71	ERROR	Hello World 2655\n	Error on Test Case 1	0	2026-02-18 11:29:49.129507
547	3	\N	print("Hello World 2721")	71	ERROR	Hello World 2721\n	Error on Test Case 1	0	2026-02-18 11:29:49.855323
546	3	\N	print("Hello World 2705")	71	ERROR	Hello World 2705\n	Error on Test Case 1	0	2026-02-18 11:29:49.676639
549	3	\N	print("Hello World 2758")	71	ERROR	Hello World 2758\n	Error on Test Case 1	0	2026-02-18 11:29:50.238603
550	3	\N	print("Hello World 2776")	71	ERROR	Hello World 2776\n	Error on Test Case 1	0	2026-02-18 11:29:50.43032
551	3	\N	print("Hello World 2792")	71	ERROR	Hello World 2792\n	Error on Test Case 1	0	2026-02-18 11:29:50.597207
552	3	\N	print("Hello World 2809")	71	ERROR	Hello World 2809\n	Error on Test Case 1	0	2026-02-18 11:29:50.778645
553	3	\N	print("Hello World 2827")	71	ERROR	Hello World 2827\n	Error on Test Case 1	0	2026-02-18 11:29:50.963024
554	3	\N	print("Hello World 2845")	71	ERROR	Hello World 2845\n	Error on Test Case 1	0	2026-02-18 11:29:51.152573
591	3	\N	print("Hello World 3364")	71	ERROR	Hello World 3364\n	Error on Test Case 1	0	2026-02-18 11:30:04.855815
555	3	\N	print("Hello World 2859")	71	ERROR	Hello World 2859\n	Error on Test Case 1	0	2026-02-18 11:29:51.296649
578	3	\N	print("Hello World 3137")	71	ERROR	Hello World 3137\n	Error on Test Case 1	0	2026-02-18 11:30:02.373379
556	3	\N	print("Hello World 2876")	71	ERROR	Hello World 2876\n	Error on Test Case 1	0	2026-02-18 11:29:51.478484
557	3	\N	print("Hello World 2893")	71	ERROR	Hello World 2893\n	Error on Test Case 1	0	2026-02-18 11:29:51.666404
558	3	\N	print("Hello World 2909")	71	ERROR	Hello World 2909\n	Error on Test Case 1	0	2026-02-18 11:29:51.833255
579	3	\N	print("Hello World 3155")	71	ERROR	Hello World 3155\n	Error on Test Case 1	0	2026-02-18 11:30:02.544249
559	3	\N	print("Hello World 2925")	71	ERROR	Hello World 2925\n	Error on Test Case 1	0	2026-02-18 11:29:51.999178
560	3	\N	print("Hello World 2942")	71	ERROR	Hello World 2942\n	Error on Test Case 1	0	2026-02-18 11:29:52.18044
603	3	\N	print("Hello World 3563")	71	ERROR	Hello World 3563\n	Error on Test Case 1	0	2026-02-18 11:30:06.993917
561	3	\N	print("Hello World 2957")	71	ERROR	Hello World 2957\n	Error on Test Case 1	0	2026-02-18 11:29:52.347546
580	3	\N	print("Hello World 3172")	71	ERROR	Hello World 3172\n	Error on Test Case 1	0	2026-02-18 11:30:02.745068
562	3	\N	print("Hello World 2976")	71	ERROR	Hello World 2976\n	Error on Test Case 1	0	2026-02-18 11:29:52.539255
563	3	\N	print("Hello World 2995")	71	ERROR	Hello World 2995\n	Error on Test Case 1	0	2026-02-18 11:29:52.736963
592	3	\N	print("Hello World 3382")	71	ERROR	Hello World 3382\n	Error on Test Case 1	0	2026-02-18 11:30:05.053981
564	3	\N	print("Hello World 3010")	71	ERROR	Hello World 3010\n	Error on Test Case 1	0	2026-02-18 11:29:52.89904
581	3	\N	print("Hello World 3192")	71	ERROR	Hello World 3192\n	Error on Test Case 1	0	2026-02-18 11:30:02.969697
565	3	\N	print("Hello World 3028")	71	ERROR	Hello World 3028\n	Error on Test Case 1	0	2026-02-18 11:29:53.088407
566	3	\N	print("Hello World 3043")	71	ERROR	Hello World 3043\n	Error on Test Case 1	0	2026-02-18 11:29:53.238846
567	3	\N	print("Hello World 3060")	71	ERROR	Hello World 3060\n	Error on Test Case 1	0	2026-02-18 11:29:53.41469
582	3	\N	print("Hello World 3208")	71	ERROR	Hello World 3208\n	Error on Test Case 1	0	2026-02-18 11:30:03.143321
568	3	\N	print("Hello World 3081")	71	ERROR	Hello World 3081\n	Error on Test Case 1	0	2026-02-18 11:29:53.629474
569	3	\N	print("Hello World 3099")	71	ERROR	Hello World 3099\n	Error on Test Case 1	0	2026-02-18 11:29:53.813689
599	3	\N	print("Hello World 3498")	71	ERROR	Hello World 3498\n	Error on Test Case 1	0	2026-02-18 11:30:06.300497
570	3	\N	print("Hello World 3119")	71	ERROR	Hello World 3119\n	Error on Test Case 1	0	2026-02-18 11:29:55.090871
583	3	\N	print("Hello World 3224")	71	ERROR	Hello World 3224\n	Error on Test Case 1	0	2026-02-18 11:30:03.342951
571	3	\N	print("Hello World 3120")	71	ERROR	Hello World 3120\n	Error on Test Case 1	0	2026-02-18 11:29:56.100137
572	3	\N	print("Hello World 3121")	71	ERROR	Hello World 3121\n	Error on Test Case 1	0	2026-02-18 11:29:57.217992
593	3	\N	print("Hello World 3397")	71	ERROR	Hello World 3397\n	Error on Test Case 1	0	2026-02-18 11:30:05.210102
573	3	\N	print("Hello World 3122")	71	ERROR	Hello World 3122\n	Error on Test Case 1	0	2026-02-18 11:29:58.117666
584	3	\N	print("Hello World 3243")	71	ERROR	Hello World 3243\n	Error on Test Case 1	0	2026-02-18 11:30:03.522243
574	3	\N	print("Hello World 3123")	71	ERROR	Hello World 3123\n	Error on Test Case 1	0	2026-02-18 11:29:59.126474
575	3	\N	print("Hello World 3124")	71	ERROR	Hello World 3124\n	Error on Test Case 1	0	2026-02-18 11:30:00.135521
576	3	\N	print("Hello World 3125")	71	ERROR	Hello World 3125\n	Error on Test Case 1	0	2026-02-18 11:30:01.143465
585	3	\N	print("Hello World 3257")	71	ERROR	Hello World 3257\n	Error on Test Case 1	0	2026-02-18 11:30:03.677524
577	3	\N	print("Hello World 3126")	71	ERROR	Hello World 3126\n	Error on Test Case 1	0	2026-02-18 11:30:02.153494
586	3	\N	print("Hello World 3272")	71	ERROR	Hello World 3272\n	Error on Test Case 1	0	2026-02-18 11:30:03.858863
594	3	\N	print("Hello World 3413")	71	ERROR	Hello World 3413\n	Error on Test Case 1	0	2026-02-18 11:30:05.382779
587	3	\N	print("Hello World 3291")	71	ERROR	Hello World 3291\n	Error on Test Case 1	0	2026-02-18 11:30:04.067045
588	3	\N	print("Hello World 3313")	71	ERROR	Hello World 3313\n	Error on Test Case 1	0	2026-02-18 11:30:04.281074
589	3	\N	print("Hello World 3330")	71	ERROR	Hello World 3330\n	Error on Test Case 1	0	2026-02-18 11:30:04.470532
595	3	\N	print("Hello World 3428")	71	ERROR	Hello World 3428\n	Error on Test Case 1	0	2026-02-18 11:30:05.555999
590	3	\N	print("Hello World 3346")	71	ERROR	Hello World 3346\n	Error on Test Case 1	0	2026-02-18 11:30:04.657704
600	3	\N	print("Hello World 3514")	71	ERROR	Hello World 3514\n	Error on Test Case 1	0	2026-02-18 11:30:06.469254
596	3	\N	print("Hello World 3446")	71	ERROR	Hello World 3446\n	Error on Test Case 1	0	2026-02-18 11:30:05.740915
607	3	\N	print("Hello World 3630")	71	ERROR	Hello World 3630\n	Error on Test Case 1	0	2026-02-18 11:30:07.703653
597	3	\N	print("Hello World 3463")	71	ERROR	Hello World 3463\n	Error on Test Case 1	0	2026-02-18 11:30:05.928105
601	3	\N	print("Hello World 3529")	71	ERROR	Hello World 3529\n	Error on Test Case 1	0	2026-02-18 11:30:06.637713
598	3	\N	print("Hello World 3481")	71	ERROR	Hello World 3481\n	Error on Test Case 1	0	2026-02-18 11:30:06.132201
604	3	\N	print("Hello World 3582")	71	ERROR	Hello World 3582\n	Error on Test Case 1	0	2026-02-18 11:30:07.215347
602	3	\N	print("Hello World 3546")	71	ERROR	Hello World 3546\n	Error on Test Case 1	0	2026-02-18 11:30:06.80352
606	3	\N	print("Hello World 3613")	71	ERROR	Hello World 3613\n	Error on Test Case 1	0	2026-02-18 11:30:07.53567
605	3	\N	print("Hello World 3595")	71	ERROR	Hello World 3595\n	Error on Test Case 1	0	2026-02-18 11:30:07.343613
608	3	\N	print("Hello World 3647")	71	ERROR	Hello World 3647\n	Error on Test Case 1	0	2026-02-18 11:30:07.881518
609	3	\N	print("Hello World 3665")	71	ERROR	Hello World 3665\n	Error on Test Case 1	0	2026-02-18 11:30:08.063138
610	3	\N	print("Hello World 3684")	71	ERROR	Hello World 3684\n	Error on Test Case 1	0	2026-02-18 11:30:08.258124
611	3	\N	print("Hello World 3703")	71	ERROR	Hello World 3703\n	Error on Test Case 1	0	2026-02-18 11:30:08.451489
612	3	\N	print("Hello World 3721")	71	ERROR	Hello World 3721\n	Error on Test Case 1	0	2026-02-18 11:30:08.636091
613	3	\N	print("Hello World 3738")	71	ERROR	Hello World 3738\n	Error on Test Case 1	0	2026-02-18 11:30:08.815505
650	3	\N	print("Hello World 4147")	71	ERROR	Hello World 4147\n	Error on Test Case 1	0	2026-02-18 11:30:26.177894
614	3	\N	print("Hello World 3756")	71	ERROR	Hello World 3756\n	Error on Test Case 1	0	2026-02-18 11:30:08.999873
637	3	\N	print("Hello World 3945")	71	ERROR	Hello World 3945\n	Error on Test Case 1	0	2026-02-18 11:30:24.014146
615	3	\N	print("Hello World 3774")	71	ERROR	Hello World 3774\n	Error on Test Case 1	0	2026-02-18 11:30:09.182176
616	3	\N	print("Hello World 3781")	71	ERROR	Hello World 3781\n	Error on Test Case 1	0	2026-02-18 11:30:10.271867
617	3	\N	print("Hello World 3782")	71	ERROR	Hello World 3782\n	Error on Test Case 1	0	2026-02-18 11:30:11.299323
638	3	\N	print("Hello World 3962")	71	ERROR	Hello World 3962\n	Error on Test Case 1	0	2026-02-18 11:30:24.201632
618	3	\N	print("Hello World 3783")	71	ERROR	Hello World 3783\n	Error on Test Case 1	0	2026-02-18 11:30:12.312613
619	3	\N	print("Hello World 3784")	71	ERROR	Hello World 3784\n	Error on Test Case 1	0	2026-02-18 11:30:13.36553
662	3	\N	print("Hello World 4324")	71	ERROR	Hello World 4324\n	Error on Test Case 1	0	2026-02-18 11:30:28.087852
620	3	\N	print("Hello World 3785")	71	ERROR	Hello World 3785\n	Error on Test Case 1	0	2026-02-18 11:30:14.387598
639	3	\N	print("Hello World 3979")	71	ERROR	Hello World 3979\n	Error on Test Case 1	0	2026-02-18 11:30:24.389912
621	3	\N	print("Hello World 3786")	71	ERROR	Hello World 3786\n	Error on Test Case 1	0	2026-02-18 11:30:15.47542
622	3	\N	print("Hello World 3787")	71	ERROR	Hello World 3787\n	Error on Test Case 1	0	2026-02-18 11:30:16.487231
651	3	\N	print("Hello World 4161")	71	ERROR	Hello World 4161\n	Error on Test Case 1	0	2026-02-18 11:30:26.328816
623	3	\N	print("Hello World 3788")	71	ERROR	Hello World 3788\n	Error on Test Case 1	0	2026-02-18 11:30:17.590373
640	3	\N	print("Hello World 3994")	71	ERROR	Hello World 3994\n	Error on Test Case 1	0	2026-02-18 11:30:24.551472
624	3	\N	print("Hello World 3789")	71	ERROR	Hello World 3789\n	Error on Test Case 1	0	2026-02-18 11:30:18.613375
625	3	\N	print("Hello World 3790")	71	ERROR	Hello World 3790\n	Error on Test Case 1	0	2026-02-18 11:30:19.704594
626	3	\N	print("Hello World 3791")	71	ERROR	Hello World 3791\n	Error on Test Case 1	0	2026-02-18 11:30:20.715763
641	3	\N	print("Hello World 4011")	71	ERROR	Hello World 4011\n	Error on Test Case 1	0	2026-02-18 11:30:24.725013
627	3	\N	print("Hello World 3792")	71	ERROR	Hello World 3792\n	Error on Test Case 1	0	2026-02-18 11:30:21.81804
628	3	\N	print("Hello World 3793")	71	ERROR	Hello World 3793\n	Error on Test Case 1	0	2026-02-18 11:30:22.367624
658	3	\N	print("Hello World 4263")	71	ERROR	Hello World 4263\n	Error on Test Case 1	0	2026-02-18 11:30:27.431411
629	3	\N	print("Hello World 3806")	71	ERROR	Hello World 3806\n	Error on Test Case 1	0	2026-02-18 11:30:22.508025
642	3	\N	print("Hello World 4024")	71	ERROR	Hello World 4024\n	Error on Test Case 1	0	2026-02-18 11:30:24.861635
630	3	\N	print("Hello World 3821")	71	ERROR	Hello World 3821\n	Error on Test Case 1	0	2026-02-18 11:30:22.690876
631	3	\N	print("Hello World 3836")	71	ERROR	Hello World 3836\n	Error on Test Case 1	0	2026-02-18 11:30:22.85398
652	3	\N	print("Hello World 4174")	71	ERROR	Hello World 4174\n	Error on Test Case 1	0	2026-02-18 11:30:26.48353
632	3	\N	print("Hello World 3856")	71	ERROR	Hello World 3856\n	Error on Test Case 1	0	2026-02-18 11:30:23.054069
643	3	\N	print("Hello World 4037")	71	ERROR	Hello World 4037\n	Error on Test Case 1	0	2026-02-18 11:30:24.998127
633	3	\N	print("Hello World 3872")	71	ERROR	Hello World 3872\n	Error on Test Case 1	0	2026-02-18 11:30:23.248769
634	3	\N	print("Hello World 3891")	71	ERROR	Hello World 3891\n	Error on Test Case 1	0	2026-02-18 11:30:23.44266
635	3	\N	print("Hello World 3908")	71	ERROR	Hello World 3908\n	Error on Test Case 1	0	2026-02-18 11:30:23.62667
644	3	\N	print("Hello World 4051")	71	ERROR	Hello World 4051\n	Error on Test Case 1	0	2026-02-18 11:30:25.148721
636	3	\N	print("Hello World 3928")	71	ERROR	Hello World 3928\n	Error on Test Case 1	0	2026-02-18 11:30:23.840105
645	3	\N	print("Hello World 4065")	71	ERROR	Hello World 4065\n	Error on Test Case 1	0	2026-02-18 11:30:25.296316
653	3	\N	print("Hello World 4189")	71	ERROR	Hello World 4189\n	Error on Test Case 1	0	2026-02-18 11:30:26.650045
646	3	\N	print("Hello World 4082")	71	ERROR	Hello World 4082\n	Error on Test Case 1	0	2026-02-18 11:30:25.492396
647	3	\N	print("Hello World 4098")	71	ERROR	Hello World 4098\n	Error on Test Case 1	0	2026-02-18 11:30:25.663396
648	3	\N	print("Hello World 4116")	71	ERROR	Hello World 4116\n	Error on Test Case 1	0	2026-02-18 11:30:25.843041
654	3	\N	print("Hello World 4203")	71	ERROR	Hello World 4203\n	Error on Test Case 1	0	2026-02-18 11:30:26.800275
649	3	\N	print("Hello World 4131")	71	ERROR	Hello World 4131\n	Error on Test Case 1	0	2026-02-18 11:30:26.012078
659	3	\N	print("Hello World 4278")	71	ERROR	Hello World 4278\n	Error on Test Case 1	0	2026-02-18 11:30:27.584807
655	3	\N	print("Hello World 4218")	71	ERROR	Hello World 4218\n	Error on Test Case 1	0	2026-02-18 11:30:26.961495
666	3	\N	print("Hello World 4389")	71	ERROR	Hello World 4389\n	Error on Test Case 1	0	2026-02-18 11:30:28.798237
656	3	\N	print("Hello World 4233")	71	ERROR	Hello World 4233\n	Error on Test Case 1	0	2026-02-18 11:30:27.116555
660	3	\N	print("Hello World 4292")	71	ERROR	Hello World 4292\n	Error on Test Case 1	0	2026-02-18 11:30:27.736951
657	3	\N	print("Hello World 4248")	71	ERROR	Hello World 4248\n	Error on Test Case 1	0	2026-02-18 11:30:27.27103
663	3	\N	print("Hello World 4339")	71	ERROR	Hello World 4339\n	Error on Test Case 1	0	2026-02-18 11:30:28.263986
661	3	\N	print("Hello World 4309")	71	ERROR	Hello World 4309\n	Error on Test Case 1	0	2026-02-18 11:30:27.915234
665	3	\N	print("Hello World 4372")	71	ERROR	Hello World 4372\n	Error on Test Case 1	0	2026-02-18 11:30:28.594347
664	3	\N	print("Hello World 4356")	71	ERROR	Hello World 4356\n	Error on Test Case 1	0	2026-02-18 11:30:28.433803
667	3	\N	print("Hello World 4407")	71	ERROR	Hello World 4407\n	Error on Test Case 1	0	2026-02-18 11:30:28.961375
668	3	\N	print("Hello World 4424")	71	ERROR	Hello World 4424\n	Error on Test Case 1	0	2026-02-18 11:30:29.139821
669	3	\N	print("Hello World 4439")	71	ERROR	Hello World 4439\n	Error on Test Case 1	0	2026-02-18 11:30:29.305812
670	3	\N	print("Hello World 4455")	71	ERROR	Hello World 4455\n	Error on Test Case 1	0	2026-02-18 11:30:29.502452
671	3	\N	print("Hello World 4472")	71	ERROR	Hello World 4472\n	Error on Test Case 1	0	2026-02-18 11:30:29.67331
672	3	\N	print("Hello World 4488")	71	ERROR	Hello World 4488\n	Error on Test Case 1	0	2026-02-18 11:30:29.822859
709	3	\N	print("Hello World 5076")	71	ERROR	Hello World 5076\n	Error on Test Case 1	0	2026-02-18 11:30:36.261533
673	3	\N	print("Hello World 4505")	71	ERROR	Hello World 4505\n	Error on Test Case 1	0	2026-02-18 11:30:30.009006
696	3	\N	print("Hello World 4867")	71	ERROR	Hello World 4867\n	Error on Test Case 1	0	2026-02-18 11:30:33.961355
674	3	\N	print("Hello World 4521")	71	ERROR	Hello World 4521\n	Error on Test Case 1	0	2026-02-18 11:30:30.171256
675	3	\N	print("Hello World 4535")	71	ERROR	Hello World 4535\n	Error on Test Case 1	0	2026-02-18 11:30:30.322643
676	3	\N	print("Hello World 4551")	71	ERROR	Hello World 4551\n	Error on Test Case 1	0	2026-02-18 11:30:30.504791
697	3	\N	print("Hello World 4885")	71	ERROR	Hello World 4885\n	Error on Test Case 1	0	2026-02-18 11:30:34.124252
677	3	\N	print("Hello World 4569")	71	ERROR	Hello World 4569\n	Error on Test Case 1	0	2026-02-18 11:30:30.702429
678	3	\N	print("Hello World 4583")	71	ERROR	Hello World 4583\n	Error on Test Case 1	0	2026-02-18 11:30:30.844526
721	3	\N	print("Hello World 5265")	71	ERROR	Hello World 5265\n	Error on Test Case 1	0	2026-02-18 11:30:38.247243
679	3	\N	print("Hello World 4599")	71	ERROR	Hello World 4599\n	Error on Test Case 1	0	2026-02-18 11:30:31.023118
698	3	\N	print("Hello World 4900")	71	ERROR	Hello World 4900\n	Error on Test Case 1	0	2026-02-18 11:30:34.290582
680	3	\N	print("Hello World 4613")	71	ERROR	Hello World 4613\n	Error on Test Case 1	0	2026-02-18 11:30:31.176164
681	3	\N	print("Hello World 4628")	71	ERROR	Hello World 4628\n	Error on Test Case 1	0	2026-02-18 11:30:31.332576
710	3	\N	print("Hello World 5094")	71	ERROR	Hello World 5094\n	Error on Test Case 1	0	2026-02-18 11:30:36.433981
682	3	\N	print("Hello World 4645")	71	ERROR	Hello World 4645\n	Error on Test Case 1	0	2026-02-18 11:30:31.51233
699	3	\N	print("Hello World 4916")	71	ERROR	Hello World 4916\n	Error on Test Case 1	0	2026-02-18 11:30:34.467647
683	3	\N	print("Hello World 4661")	71	ERROR	Hello World 4661\n	Error on Test Case 1	0	2026-02-18 11:30:31.689892
684	3	\N	print("Hello World 4677")	71	ERROR	Hello World 4677\n	Error on Test Case 1	0	2026-02-18 11:30:31.859219
685	3	\N	print("Hello World 4692")	71	ERROR	Hello World 4692\n	Error on Test Case 1	0	2026-02-18 11:30:32.031781
700	3	\N	print("Hello World 4932")	71	ERROR	Hello World 4932\n	Error on Test Case 1	0	2026-02-18 11:30:34.670485
686	3	\N	print("Hello World 4710")	71	ERROR	Hello World 4710\n	Error on Test Case 1	0	2026-02-18 11:30:32.236471
687	3	\N	print("Hello World 4726")	71	ERROR	Hello World 4726\n	Error on Test Case 1	0	2026-02-18 11:30:32.419716
717	3	\N	print("Hello World 5202")	71	ERROR	Hello World 5202\n	Error on Test Case 1	0	2026-02-18 11:30:37.563012
688	3	\N	print("Hello World 4742")	71	ERROR	Hello World 4742\n	Error on Test Case 1	0	2026-02-18 11:30:32.590127
701	3	\N	print("Hello World 4949")	71	ERROR	Hello World 4949\n	Error on Test Case 1	0	2026-02-18 11:30:34.861851
689	3	\N	print("Hello World 4757")	71	ERROR	Hello World 4757\n	Error on Test Case 1	0	2026-02-18 11:30:32.748622
690	3	\N	print("Hello World 4776")	71	ERROR	Hello World 4776\n	Error on Test Case 1	0	2026-02-18 11:30:32.958488
711	3	\N	print("Hello World 5107")	71	ERROR	Hello World 5107\n	Error on Test Case 1	0	2026-02-18 11:30:36.59199
691	3	\N	print("Hello World 4792")	71	ERROR	Hello World 4792\n	Error on Test Case 1	0	2026-02-18 11:30:33.135638
702	3	\N	print("Hello World 4967")	71	ERROR	Hello World 4967\n	Error on Test Case 1	0	2026-02-18 11:30:35.027935
692	3	\N	print("Hello World 4807")	71	ERROR	Hello World 4807\n	Error on Test Case 1	0	2026-02-18 11:30:33.29015
693	3	\N	print("Hello World 4822")	71	ERROR	Hello World 4822\n	Error on Test Case 1	0	2026-02-18 11:30:33.4484
694	3	\N	print("Hello World 4837")	71	ERROR	Hello World 4837\n	Error on Test Case 1	0	2026-02-18 11:30:33.606398
703	3	\N	print("Hello World 4980")	71	ERROR	Hello World 4980\n	Error on Test Case 1	0	2026-02-18 11:30:35.167801
695	3	\N	print("Hello World 4853")	71	ERROR	Hello World 4853\n	Error on Test Case 1	0	2026-02-18 11:30:33.780636
704	3	\N	print("Hello World 4996")	71	ERROR	Hello World 4996\n	Error on Test Case 1	0	2026-02-18 11:30:35.392162
712	3	\N	print("Hello World 5123")	71	ERROR	Hello World 5123\n	Error on Test Case 1	0	2026-02-18 11:30:36.728257
705	3	\N	print("Hello World 5014")	71	ERROR	Hello World 5014\n	Error on Test Case 1	0	2026-02-18 11:30:35.581244
706	3	\N	print("Hello World 5030")	71	ERROR	Hello World 5030\n	Error on Test Case 1	0	2026-02-18 11:30:35.722957
707	3	\N	print("Hello World 5046")	71	ERROR	Hello World 5046\n	Error on Test Case 1	0	2026-02-18 11:30:35.898966
713	3	\N	print("Hello World 5140")	71	ERROR	Hello World 5140\n	Error on Test Case 1	0	2026-02-18 11:30:36.914222
708	3	\N	print("Hello World 5061")	71	ERROR	Hello World 5061\n	Error on Test Case 1	0	2026-02-18 11:30:36.0762
718	3	\N	print("Hello World 5215")	71	ERROR	Hello World 5215\n	Error on Test Case 1	0	2026-02-18 11:30:37.707152
714	3	\N	print("Hello World 5154")	71	ERROR	Hello World 5154\n	Error on Test Case 1	0	2026-02-18 11:30:37.10579
725	3	\N	print("Hello World 5326")	71	ERROR	Hello World 5326\n	Error on Test Case 1	0	2026-02-18 11:30:38.910957
715	3	\N	print("Hello World 5173")	71	ERROR	Hello World 5173\n	Error on Test Case 1	0	2026-02-18 11:30:37.256501
719	3	\N	print("Hello World 5231")	71	ERROR	Hello World 5231\n	Error on Test Case 1	0	2026-02-18 11:30:37.87948
716	3	\N	print("Hello World 5188")	71	ERROR	Hello World 5188\n	Error on Test Case 1	0	2026-02-18 11:30:37.414089
722	3	\N	print("Hello World 5279")	71	ERROR	Hello World 5279\n	Error on Test Case 1	0	2026-02-18 11:30:38.397131
720	3	\N	print("Hello World 5249")	71	ERROR	Hello World 5249\n	Error on Test Case 1	0	2026-02-18 11:30:38.073126
724	3	\N	print("Hello World 5309")	71	ERROR	Hello World 5309\n	Error on Test Case 1	0	2026-02-18 11:30:38.725459
723	3	\N	print("Hello World 5293")	71	ERROR	Hello World 5293\n	Error on Test Case 1	0	2026-02-18 11:30:38.548938
726	3	\N	print("Hello World 5343")	71	ERROR	Hello World 5343\n	Error on Test Case 1	0	2026-02-18 11:30:39.10447
727	3	\N	print("Hello World 5359")	71	ERROR	Hello World 5359\n	Error on Test Case 1	0	2026-02-18 11:30:39.289782
728	3	\N	print("Hello World 5378")	71	ERROR	Hello World 5378\n	Error on Test Case 1	0	2026-02-18 11:30:39.466172
729	3	\N	print("Hello World 5393")	71	ERROR	Hello World 5393\n	Error on Test Case 1	0	2026-02-18 11:30:39.635996
730	3	\N	print("Hello World 5410")	71	ERROR	Hello World 5410\n	Error on Test Case 1	0	2026-02-18 11:30:39.809965
731	3	\N	print("Hello World 5424")	71	ERROR	Hello World 5424\n	Error on Test Case 1	0	2026-02-18 11:30:39.950515
768	3	\N	print("Hello World 5995")	71	ERROR	Hello World 5995\n	Error on Test Case 1	0	2026-02-18 11:30:46.125025
732	3	\N	print("Hello World 5438")	71	ERROR	Hello World 5438\n	Error on Test Case 1	0	2026-02-18 11:30:40.102959
755	3	\N	print("Hello World 5798")	71	ERROR	Hello World 5798\n	Error on Test Case 1	0	2026-02-18 11:30:43.988818
733	3	\N	print("Hello World 5455")	71	ERROR	Hello World 5455\n	Error on Test Case 1	0	2026-02-18 11:30:40.285168
734	3	\N	print("Hello World 5468")	71	ERROR	Hello World 5468\n	Error on Test Case 1	0	2026-02-18 11:30:40.433528
735	3	\N	print("Hello World 5483")	71	ERROR	Hello World 5483\n	Error on Test Case 1	0	2026-02-18 11:30:40.587728
756	3	\N	print("Hello World 5813")	71	ERROR	Hello World 5813\n	Error on Test Case 1	0	2026-02-18 11:30:44.161268
736	3	\N	print("Hello World 5498")	71	ERROR	Hello World 5498\n	Error on Test Case 1	0	2026-02-18 11:30:40.751703
737	3	\N	print("Hello World 5517")	71	ERROR	Hello World 5517\n	Error on Test Case 1	0	2026-02-18 11:30:40.959583
780	3	\N	print("Hello World 6197")	71	ERROR	Hello World 6197\n	Error on Test Case 1	0	2026-02-18 11:30:48.281008
738	3	\N	print("Hello World 5534")	71	ERROR	Hello World 5534\n	Error on Test Case 1	0	2026-02-18 11:30:41.152494
757	3	\N	print("Hello World 5829")	71	ERROR	Hello World 5829\n	Error on Test Case 1	0	2026-02-18 11:30:44.345752
739	3	\N	print("Hello World 5549")	71	ERROR	Hello World 5549\n	Error on Test Case 1	0	2026-02-18 11:30:41.310335
740	3	\N	print("Hello World 5563")	71	ERROR	Hello World 5563\n	Error on Test Case 1	0	2026-02-18 11:30:41.440133
769	3	\N	print("Hello World 6009")	71	ERROR	Hello World 6009\n	Error on Test Case 1	0	2026-02-18 11:30:46.267336
741	3	\N	print("Hello World 5580")	71	ERROR	Hello World 5580\n	Error on Test Case 1	0	2026-02-18 11:30:41.630832
758	3	\N	print("Hello World 5844")	71	ERROR	Hello World 5844\n	Error on Test Case 1	0	2026-02-18 11:30:44.494796
742	3	\N	print("Hello World 5597")	71	ERROR	Hello World 5597\n	Error on Test Case 1	0	2026-02-18 11:30:41.819614
743	3	\N	print("Hello World 5611")	71	ERROR	Hello World 5611\n	Error on Test Case 1	0	2026-02-18 11:30:41.962934
744	3	\N	print("Hello World 5627")	71	ERROR	Hello World 5627\n	Error on Test Case 1	0	2026-02-18 11:30:42.142017
759	3	\N	print("Hello World 5858")	71	ERROR	Hello World 5858\n	Error on Test Case 1	0	2026-02-18 11:30:44.64546
745	3	\N	print("Hello World 5641")	71	ERROR	Hello World 5641\n	Error on Test Case 1	0	2026-02-18 11:30:42.298125
746	3	\N	print("Hello World 5655")	71	ERROR	Hello World 5655\n	Error on Test Case 1	0	2026-02-18 11:30:42.454005
776	3	\N	print("Hello World 6129")	71	ERROR	Hello World 6129\n	Error on Test Case 1	0	2026-02-18 11:30:47.546511
747	3	\N	print("Hello World 5670")	71	ERROR	Hello World 5670\n	Error on Test Case 1	0	2026-02-18 11:30:42.60197
760	3	\N	print("Hello World 5875")	71	ERROR	Hello World 5875\n	Error on Test Case 1	0	2026-02-18 11:30:44.834779
748	3	\N	print("Hello World 5684")	71	ERROR	Hello World 5684\n	Error on Test Case 1	0	2026-02-18 11:30:42.759561
749	3	\N	print("Hello World 5698")	71	ERROR	Hello World 5698\n	Error on Test Case 1	0	2026-02-18 11:30:42.94227
770	3	\N	print("Hello World 6024")	71	ERROR	Hello World 6024\n	Error on Test Case 1	0	2026-02-18 11:30:46.458942
750	3	\N	print("Hello World 5716")	71	ERROR	Hello World 5716\n	Error on Test Case 1	0	2026-02-18 11:30:43.143213
761	3	\N	print("Hello World 5889")	71	ERROR	Hello World 5889\n	Error on Test Case 1	0	2026-02-18 11:30:44.991907
751	3	\N	print("Hello World 5738")	71	ERROR	Hello World 5738\n	Error on Test Case 1	0	2026-02-18 11:30:43.346094
752	3	\N	print("Hello World 5754")	71	ERROR	Hello World 5754\n	Error on Test Case 1	0	2026-02-18 11:30:43.521944
753	3	\N	print("Hello World 5767")	71	ERROR	Hello World 5767\n	Error on Test Case 1	0	2026-02-18 11:30:43.658562
762	3	\N	print("Hello World 5903")	71	ERROR	Hello World 5903\n	Error on Test Case 1	0	2026-02-18 11:30:45.146849
754	3	\N	print("Hello World 5782")	71	ERROR	Hello World 5782\n	Error on Test Case 1	0	2026-02-18 11:30:43.812011
763	3	\N	print("Hello World 5920")	71	ERROR	Hello World 5920\n	Error on Test Case 1	0	2026-02-18 11:30:45.330429
771	3	\N	print("Hello World 6043")	71	ERROR	Hello World 6043\n	Error on Test Case 1	0	2026-02-18 11:30:46.672394
764	3	\N	print("Hello World 5935")	71	ERROR	Hello World 5935\n	Error on Test Case 1	0	2026-02-18 11:30:45.489606
765	3	\N	print("Hello World 5951")	71	ERROR	Hello World 5951\n	Error on Test Case 1	0	2026-02-18 11:30:45.66059
766	3	\N	print("Hello World 5966")	71	ERROR	Hello World 5966\n	Error on Test Case 1	0	2026-02-18 11:30:45.822709
772	3	\N	print("Hello World 6061")	71	ERROR	Hello World 6061\n	Error on Test Case 1	0	2026-02-18 11:30:46.845165
767	3	\N	print("Hello World 5980")	71	ERROR	Hello World 5980\n	Error on Test Case 1	0	2026-02-18 11:30:45.966871
777	3	\N	print("Hello World 6144")	71	ERROR	Hello World 6144\n	Error on Test Case 1	0	2026-02-18 11:30:47.721062
773	3	\N	print("Hello World 6078")	71	ERROR	Hello World 6078\n	Error on Test Case 1	0	2026-02-18 11:30:47.009414
784	3	\N	print("Hello World 6256")	71	ERROR	Hello World 6256\n	Error on Test Case 1	0	2026-02-18 11:30:48.906129
774	3	\N	print("Hello World 6093")	71	ERROR	Hello World 6093\n	Error on Test Case 1	0	2026-02-18 11:30:47.171304
778	3	\N	print("Hello World 6162")	71	ERROR	Hello World 6162\n	Error on Test Case 1	0	2026-02-18 11:30:47.907665
775	3	\N	print("Hello World 6110")	71	ERROR	Hello World 6110\n	Error on Test Case 1	0	2026-02-18 11:30:47.359905
781	3	\N	print("Hello World 6211")	71	ERROR	Hello World 6211\n	Error on Test Case 1	0	2026-02-18 11:30:48.425811
779	3	\N	print("Hello World 6178")	71	ERROR	Hello World 6178\n	Error on Test Case 1	0	2026-02-18 11:30:48.07908
783	3	\N	print("Hello World 6241")	71	ERROR	Hello World 6241\n	Error on Test Case 1	0	2026-02-18 11:30:48.748565
782	3	\N	print("Hello World 6224")	71	ERROR	Hello World 6224\n	Error on Test Case 1	0	2026-02-18 11:30:48.563576
785	3	\N	print("Hello World 6271")	71	ERROR	Hello World 6271\n	Error on Test Case 1	0	2026-02-18 11:30:49.060522
786	3	\N	print("Hello World 6290")	71	ERROR	Hello World 6290\n	Error on Test Case 1	0	2026-02-18 11:30:49.281284
787	3	\N	print("Hello World 6305")	71	ERROR	Hello World 6305\n	Error on Test Case 1	0	2026-02-18 11:30:49.419722
788	3	\N	print("Hello World 6319")	71	ERROR	Hello World 6319\n	Error on Test Case 1	0	2026-02-18 11:30:49.565026
789	3	\N	print("Hello World 6335")	71	ERROR	Hello World 6335\n	Error on Test Case 1	0	2026-02-18 11:30:49.734835
790	3	\N	print("Hello World 6351")	71	ERROR	Hello World 6351\n	Error on Test Case 1	0	2026-02-18 11:30:49.911965
814	3	\N	print("Hello World 32")	71	ERROR	Hello World 32\n	Error on Test Case 1	0	2026-02-18 11:32:06.176249
791	3	\N	print("Hello World 6368")	71	ERROR	Hello World 6368\n	Error on Test Case 1	0	2026-02-18 11:30:50.091753
792	3	\N	print("Hello World 6385")	71	ERROR	Hello World 6385\n	Error on Test Case 1	0	2026-02-18 11:30:50.272848
835	3	\N	print("Hello World 362")	71	ERROR	Hello World 362\n	Error on Test Case 1	0	2026-02-18 11:32:09.787193
793	3	\N	print("Hello World 6403")	71	ERROR	Hello World 6403\n	Error on Test Case 1	0	2026-02-18 11:30:50.470306
815	3	\N	print("Hello World 50")	71	ERROR	Hello World 50\n	Error on Test Case 1	0	2026-02-18 11:32:06.34633
794	3	\N	print("Hello World 6419")	71	ERROR	Hello World 6419\n	Error on Test Case 1	0	2026-02-18 11:30:50.643205
795	3	\N	print("Hello World 6434")	71	ERROR	Hello World 6434\n	Error on Test Case 1	0	2026-02-18 11:30:50.800647
828	3	\N	print("Hello World 256")	71	ERROR	Hello World 256\n	Error on Test Case 1	0	2026-02-18 11:32:08.628821
796	3	\N	print("Hello World 6450")	71	ERROR	Hello World 6450\n	Error on Test Case 1	0	2026-02-18 11:30:51.008548
816	3	\N	print("Hello World 66")	71	ERROR	Hello World 66\n	Error on Test Case 1	0	2026-02-18 11:32:06.529802
797	3	\N	print("Hello World 6473")	71	ERROR	Hello World 6473\n	Error on Test Case 1	0	2026-02-18 11:30:51.204369
798	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-18 11:31:33.322107
799	3	\N	print("Hello World 4")	71	ERROR	Hello World 4\n	Error on Test Case 1	0	2026-02-18 11:31:33.359502
817	3	\N	print("Hello World 80")	71	ERROR	Hello World 80\n	Error on Test Case 1	0	2026-02-18 11:32:06.706291
800	3	\N	print("Hello World 16")	71	ERROR	Hello World 16\n	Error on Test Case 1	0	2026-02-18 11:31:33.506531
801	3	\N	print("Hello World 30")	71	ERROR	Hello World 30\n	Error on Test Case 1	0	2026-02-18 11:31:33.656509
802	3	\N	print("Hello World 46")	71	ERROR	Hello World 46\n	Error on Test Case 1	0	2026-02-18 11:31:33.843823
818	3	\N	print("Hello World 95")	71	ERROR	Hello World 95\n	Error on Test Case 1	0	2026-02-18 11:32:06.844428
803	3	\N	print("Hello World 60")	71	ERROR	Hello World 60\n	Error on Test Case 1	0	2026-02-18 11:31:33.991476
804	3	\N	print("Hello World 73")	71	ERROR	Hello World 73\n	Error on Test Case 1	0	2026-02-18 11:31:34.161169
829	3	\N	print("Hello World 271")	71	ERROR	Hello World 271\n	Error on Test Case 1	0	2026-02-18 11:32:08.793521
805	3	\N	print("Hello World 92")	71	ERROR	Hello World 92\n	Error on Test Case 1	0	2026-02-18 11:31:34.382235
819	3	\N	print("Hello World 110")	71	ERROR	Hello World 110\n	Error on Test Case 1	0	2026-02-18 11:32:07.043047
806	3	\N	print("Hello World 111")	71	ERROR	Hello World 111\n	Error on Test Case 1	0	2026-02-18 11:31:34.571362
807	3	\N	print("Hello World 125")	71	ERROR	Hello World 125\n	Error on Test Case 1	0	2026-02-18 11:31:34.712903
808	3	\N	print("Hello World 141")	71	ERROR	Hello World 141\n	Error on Test Case 1	0	2026-02-18 11:31:34.901447
820	3	\N	print("Hello World 128")	71	ERROR	Hello World 128\n	Error on Test Case 1	0	2026-02-18 11:32:07.194531
809	3	\N	print("Hello World 159")	71	ERROR	Hello World 159\n	Error on Test Case 1	0	2026-02-18 11:31:35.099268
810	3	\N	print("Hello World 173")	71	ERROR	Hello World 173\n	Error on Test Case 1	0	2026-02-18 11:31:35.242506
843	3	\N	print("Hello World 495")	71	ERROR	Hello World 495\n	Error on Test Case 1	0	2026-02-18 11:32:11.146276
811	3	\N	print("Hello World 186")	71	ERROR	Hello World 186\n	Error on Test Case 1	0	2026-02-18 11:31:35.386276
821	3	\N	print("Hello World 143")	71	ERROR	Hello World 143\n	Error on Test Case 1	0	2026-02-18 11:32:07.366801
812	3	\N	print("Hello World 200")	71	ERROR	Hello World 200\n	Error on Test Case 1	0	2026-02-18 11:32:05.803622
813	3	\N	print("Hello World 18")	71	ERROR	Hello World 18\n	Error on Test Case 1	0	2026-02-18 11:32:05.976777
830	3	\N	print("Hello World 288")	71	ERROR	Hello World 288\n	Error on Test Case 1	0	2026-02-18 11:32:08.975274
822	3	\N	print("Hello World 160")	71	ERROR	Hello World 160\n	Error on Test Case 1	0	2026-02-18 11:32:07.574062
836	3	\N	print("Hello World 377")	71	ERROR	Hello World 377\n	Error on Test Case 1	0	2026-02-18 11:32:09.941985
823	3	\N	print("Hello World 178")	71	ERROR	Hello World 178\n	Error on Test Case 1	0	2026-02-18 11:32:07.76771
831	3	\N	print("Hello World 304")	71	ERROR	Hello World 304\n	Error on Test Case 1	0	2026-02-18 11:32:09.155275
824	3	\N	print("Hello World 193")	71	ERROR	Hello World 193\n	Error on Test Case 1	0	2026-02-18 11:32:07.968469
825	3	\N	print("Hello World 212")	71	ERROR	Hello World 212\n	Error on Test Case 1	0	2026-02-18 11:32:08.155192
826	3	\N	print("Hello World 227")	71	ERROR	Hello World 227\n	Error on Test Case 1	0	2026-02-18 11:32:08.313374
832	3	\N	print("Hello World 318")	71	ERROR	Hello World 318\n	Error on Test Case 1	0	2026-02-18 11:32:09.308233
827	3	\N	print("Hello World 242")	71	ERROR	Hello World 242\n	Error on Test Case 1	0	2026-02-18 11:32:08.481597
840	3	\N	print("Hello World 444")	71	ERROR	Hello World 444\n	Error on Test Case 1	0	2026-02-18 11:32:10.626815
833	3	\N	print("Hello World 333")	71	ERROR	Hello World 333\n	Error on Test Case 1	0	2026-02-18 11:32:09.479316
837	3	\N	print("Hello World 393")	71	ERROR	Hello World 393\n	Error on Test Case 1	0	2026-02-18 11:32:10.104218
834	3	\N	print("Hello World 347")	71	ERROR	Hello World 347\n	Error on Test Case 1	0	2026-02-18 11:32:09.630089
842	3	\N	print("Hello World 478")	71	ERROR	Hello World 478\n	Error on Test Case 1	0	2026-02-18 11:32:10.982499
838	3	\N	print("Hello World 409")	71	ERROR	Hello World 409\n	Error on Test Case 1	0	2026-02-18 11:32:10.268078
841	3	\N	print("Hello World 459")	71	ERROR	Hello World 459\n	Error on Test Case 1	0	2026-02-18 11:32:10.782481
839	3	\N	print("Hello World 426")	71	ERROR	Hello World 426\n	Error on Test Case 1	0	2026-02-18 11:32:10.442133
844	3	\N	print("Hello World 511")	71	ERROR	Hello World 511\n	Error on Test Case 1	0	2026-02-18 11:32:11.314154
845	3	\N	print("Hello World 529")	71	ERROR	Hello World 529\n	Error on Test Case 1	0	2026-02-18 11:32:11.494252
846	3	\N	print("Hello World 532")	71	ERROR	Hello World 532\n	Error on Test Case 1	0	2026-02-18 11:32:12.526194
847	3	\N	print("Hello World 533")	71	ERROR	Hello World 533\n	Error on Test Case 1	0	2026-02-18 11:32:13.534648
848	3	\N	print("Hello World 534")	71	ERROR	Hello World 534\n	Error on Test Case 1	0	2026-02-18 11:32:14.54327
849	3	\N	print("Hello World 535")	71	ERROR	Hello World 535\n	Error on Test Case 1	0	2026-02-18 11:32:15.5528
850	3	\N	print("Hello World 536")	71	ERROR	Hello World 536\n	Error on Test Case 1	0	2026-02-18 11:32:16.563371
851	3	\N	print("Hello World 537")	71	ERROR	Hello World 537\n	Error on Test Case 1	0	2026-02-18 11:32:17.570051
852	3	\N	print("Hello World 538")	71	ERROR	Hello World 538\n	Error on Test Case 1	0	2026-02-18 11:32:18.578525
894	3	\N	print("Hello World 605")	71	ERROR	Hello World 605\n	Error on Test Case 1	0	2026-02-18 11:32:59.915293
853	3	\N	print("Hello World 539")	71	ERROR	Hello World 539\n	Error on Test Case 1	0	2026-02-18 11:32:19.587755
874	3	\N	print("Hello World 560")	71	ERROR	Hello World 560\n	Error on Test Case 1	0	2026-02-18 11:32:41.077136
854	3	\N	print("Hello World 540")	71	ERROR	Hello World 540\n	Error on Test Case 1	0	2026-02-18 11:32:20.681677
855	3	\N	print("Hello World 541")	71	ERROR	Hello World 541\n	Error on Test Case 1	0	2026-02-18 11:32:21.694705
887	3	\N	print("Hello World 573")	71	ERROR	Hello World 573\n	Error on Test Case 1	0	2026-02-18 11:32:54.459666
856	3	\N	print("Hello World 542")	71	ERROR	Hello World 542\n	Error on Test Case 1	0	2026-02-18 11:32:22.699191
875	3	\N	print("Hello World 561")	71	ERROR	Hello World 561\n	Error on Test Case 1	0	2026-02-18 11:32:42.177711
857	3	\N	print("Hello World 543")	71	ERROR	Hello World 543\n	Error on Test Case 1	0	2026-02-18 11:32:23.708062
858	3	\N	print("Hello World 544")	71	ERROR	Hello World 544\n	Error on Test Case 1	0	2026-02-18 11:32:24.718681
859	3	\N	print("Hello World 545")	71	ERROR	Hello World 545\n	Error on Test Case 1	0	2026-02-18 11:32:25.728327
876	3	\N	print("Hello World 562")	71	ERROR	Hello World 562\n	Error on Test Case 1	0	2026-02-18 11:32:43.18212
860	3	\N	print("Hello World 546")	71	ERROR	Hello World 546\n	Error on Test Case 1	0	2026-02-18 11:32:26.741635
861	3	\N	print("Hello World 547")	71	ERROR	Hello World 547\n	Error on Test Case 1	0	2026-02-18 11:32:27.745619
862	3	\N	print("Hello World 548")	71	ERROR	Hello World 548\n	Error on Test Case 1	0	2026-02-18 11:32:28.755602
877	3	\N	print("Hello World 563")	71	ERROR	Hello World 563\n	Error on Test Case 1	0	2026-02-18 11:32:44.191039
863	3	\N	print("Hello World 549")	71	ERROR	Hello World 549\n	Error on Test Case 1	0	2026-02-18 11:32:29.765583
864	3	\N	print("Hello World 550")	71	ERROR	Hello World 550\n	Error on Test Case 1	0	2026-02-18 11:32:30.891797
888	3	\N	print("Hello World 574")	71	ERROR	Hello World 574\n	Error on Test Case 1	0	2026-02-18 11:32:55.468183
865	3	\N	print("Hello World 551")	71	ERROR	Hello World 551\n	Error on Test Case 1	0	2026-02-18 11:32:31.907081
878	3	\N	print("Hello World 564")	71	ERROR	Hello World 564\n	Error on Test Case 1	0	2026-02-18 11:32:45.202105
866	3	\N	print("Hello World 552")	71	ERROR	Hello World 552\n	Error on Test Case 1	0	2026-02-18 11:32:32.912278
867	3	\N	print("Hello World 553")	71	ERROR	Hello World 553\n	Error on Test Case 1	0	2026-02-18 11:32:33.921547
868	3	\N	print("Hello World 554")	71	ERROR	Hello World 554\n	Error on Test Case 1	0	2026-02-18 11:32:34.932575
879	3	\N	print("Hello World 565")	71	ERROR	Hello World 565\n	Error on Test Case 1	0	2026-02-18 11:32:46.21323
869	3	\N	print("Hello World 555")	71	ERROR	Hello World 555\n	Error on Test Case 1	0	2026-02-18 11:32:35.941146
870	3	\N	print("Hello World 556")	71	ERROR	Hello World 556\n	Error on Test Case 1	0	2026-02-18 11:32:37.045784
902	3	\N	print("Hello World 732")	71	ERROR	Hello World 732\n	Error on Test Case 1	0	2026-02-18 11:33:01.331501
871	3	\N	print("Hello World 557")	71	ERROR	Hello World 557\n	Error on Test Case 1	0	2026-02-18 11:32:38.046202
880	3	\N	print("Hello World 566")	71	ERROR	Hello World 566\n	Error on Test Case 1	0	2026-02-18 11:32:47.315444
872	3	\N	print("Hello World 558")	71	ERROR	Hello World 558\n	Error on Test Case 1	0	2026-02-18 11:32:39.056378
873	3	\N	print("Hello World 559")	71	ERROR	Hello World 559\n	Error on Test Case 1	0	2026-02-18 11:32:40.067209
889	3	\N	print("Hello World 575")	71	ERROR	Hello World 575\n	Error on Test Case 1	0	2026-02-18 11:32:56.477155
881	3	\N	print("Hello World 567")	71	ERROR	Hello World 567\n	Error on Test Case 1	0	2026-02-18 11:32:48.31705
882	3	\N	print("Hello World 568")	71	ERROR	Hello World 568\n	Error on Test Case 1	0	2026-02-18 11:32:49.328551
895	3	\N	print("Hello World 618")	71	ERROR	Hello World 618\n	Error on Test Case 1	0	2026-02-18 11:33:00.085836
883	3	\N	print("Hello World 569")	71	ERROR	Hello World 569\n	Error on Test Case 1	0	2026-02-18 11:32:50.341392
890	3	\N	print("Hello World 576")	71	ERROR	Hello World 576\n	Error on Test Case 1	0	2026-02-18 11:32:57.579664
884	3	\N	print("Hello World 570")	71	ERROR	Hello World 570\n	Error on Test Case 1	0	2026-02-18 11:32:51.349119
885	3	\N	print("Hello World 571")	71	ERROR	Hello World 571\n	Error on Test Case 1	0	2026-02-18 11:32:52.443144
886	3	\N	print("Hello World 572")	71	ERROR	Hello World 572\n	Error on Test Case 1	0	2026-02-18 11:32:53.450127
891	3	\N	print("Hello World 577")	71	ERROR	Hello World 577\n	Error on Test Case 1	0	2026-02-18 11:32:58.583307
899	3	\N	print("Hello World 687")	71	ERROR	Hello World 687\n	Error on Test Case 1	0	2026-02-18 11:33:00.830117
892	3	\N	print("Hello World 578")	71	ERROR	Hello World 578\n	Error on Test Case 1	0	2026-02-18 11:32:59.59441
896	3	\N	print("Hello World 636")	71	ERROR	Hello World 636\n	Error on Test Case 1	0	2026-02-18 11:33:00.276419
893	3	\N	print("Hello World 590")	71	ERROR	Hello World 590\n	Error on Test Case 1	0	2026-02-18 11:32:59.76267
901	3	\N	print("Hello World 716")	71	ERROR	Hello World 716\n	Error on Test Case 1	0	2026-02-18 11:33:01.153068
897	3	\N	print("Hello World 653")	71	ERROR	Hello World 653\n	Error on Test Case 1	0	2026-02-18 11:33:00.461052
900	3	\N	print("Hello World 701")	71	ERROR	Hello World 701\n	Error on Test Case 1	0	2026-02-18 11:33:00.982496
898	3	\N	print("Hello World 668")	71	ERROR	Hello World 668\n	Error on Test Case 1	0	2026-02-18 11:33:00.616043
903	3	\N	print("Hello World 747")	71	ERROR	Hello World 747\n	Error on Test Case 1	0	2026-02-18 11:33:01.48106
904	3	\N	print("Hello World 764")	71	ERROR	Hello World 764\n	Error on Test Case 1	0	2026-02-18 11:33:01.665757
905	3	\N	print("Hello World 780")	71	ERROR	Hello World 780\n	Error on Test Case 1	0	2026-02-18 11:33:01.832988
906	3	\N	print("Hello World 796")	71	ERROR	Hello World 796\n	Error on Test Case 1	0	2026-02-18 11:33:02.006577
907	3	\N	print(upper(input()))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(upper(input()))\nNameError: name 'upper' is not defined\n	0.015	2026-02-18 11:35:00.974691
929	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	ACCEPTED	3\n		0.021	2026-02-20 18:02:19.947068
908	3	\N	print(toupper(input()))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(toupper(input()))\nNameError: name 'toupper' is not defined\n	0.012	2026-02-18 11:35:13.578396
909	3	\N	print(input().toupper())	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(input().toupper())\nAttributeError: 'str' object has no attribute 'toupper'\n	0.013	2026-02-18 11:35:24.984729
910	3	\N	print(input().upper())	71	ACCEPTED	A\n		0.023	2026-02-18 11:35:31.463715
927	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:02:01.593413
911	3	\N	print(input().upper())	71	ACCEPTED			0.022	2026-02-18 11:35:36.460134
928	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:02:07.982798
912	3	\N	print(input().upper())	71	ACCEPTED			0.021	2026-02-18 11:35:58.126342
913	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-18 11:36:43.768978
941	1	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.03	2026-02-20 18:11:30.28409
914	3	\N	print(input().upper())	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    print(input().upper())\nEOFError: EOF when reading a line\n	0.02	2026-02-18 11:36:56.544101
915	3	\N	print(input().upper())	71	ACCEPTED			0.022	2026-02-18 11:36:57.472567
916	3	\N	n = int(input())\n\nif n%5 == 0:\n    print("Yes")\nelse:\n    print("No")	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 17:47:05.46855
930	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:02:24.283144
917	3	\N	n = int(input())\n\nif n%5 == 0:\n    print("Yes")\nelse:\n    print("No")	71	ACCEPTED			0.031	2026-02-20 17:47:45.707739
918	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 17:50:40.459147
949	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a = int(input())\nEOFError: EOF when reading a line\n	0.02	2026-02-20 18:27:08.67876
919	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 17:51:53.181737
933	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	ACCEPTED	3\n		0.025	2026-02-20 18:03:03.046496
920	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 17:55:55.06305
921	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	ACCEPTED	126\n		0.019	2026-02-20 17:57:56.148765
942	1	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:11:33.477149
922	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 17:57:59.226105
931	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:02:38.327854
923	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.025	2026-02-20 17:59:39.564815
932	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:02:47.667641
924	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:00:01.777532
925	3	\N	a = int(input())\nb = int(input())	71	ACCEPTED			0.011	2026-02-20 18:01:39.607486
926	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	ACCEPTED	3\n		0.023	2026-02-20 18:01:49.989023
943	1	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.019	2026-02-20 18:12:30.663584
934	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:03:05.317331
935	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:03:17.826746
953	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.022	2026-02-20 18:27:17.155402
936	3	\N	a = int(input())\nb = int(input())\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:04:49.153672
937	1	\N	pri"lo")	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:05:51.76821
950	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.024	2026-02-20 18:27:14.632529
938	1	\N	print(5+10)	71	ACCEPTED	15\n		0.013	2026-02-20 18:06:36.915199
944	1	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:12:32.04965
939	1	\N	print(5+10)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:06:45.382451
945	1	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:12:45.221567
940	1	\N	import sys\ninput_data = sys.stdsplit()\nif ata) >= 2:\n    prinnt(input_[0]) + int(input_da]))	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:07:33.501582
946	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:23:17.206678
947	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	FAILED	\N	timeout of 30000ms exceeded	\N	2026-02-20 18:23:32.691802
957	3	\N	n = int(input())\n\n\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")	71	ACCEPTED			0.023	2026-02-20 18:27:56.647182
951	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.02	2026-02-20 18:27:16.188147
956	3	\N	print("HELLO WORLD")	71	ERROR	HELLO WORLD\n	Error on Test Case 1	0	2026-02-20 18:27:34.267691
952	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.021	2026-02-20 18:27:16.820027
954	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.02	2026-02-20 18:27:17.403433
955	3	\N	print("HELLO WORLD")	71	ACCEPTED	HELLO WORLD\n		0.018	2026-02-20 18:27:33.023626
948	3	\N	print("Hellow wdfs")	71	ACCEPTED	Hellow wdfs\n		0.021	2026-02-20 18:26:09.161817
958	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    a = int(input())\nEOFError: EOF when reading a line\n	0.024	2026-02-20 18:28:09.066488
959	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED	3\n		0.021	2026-02-20 18:28:28.334496
960	3	\N	a = int(input())\nb = int(input())\n\nprint(a+b)	71	ACCEPTED			0.022	2026-02-20 18:28:30.556981
961	3	\N	a = int(input())\nif a % 2 == 0:\n    print("Even")\nelse\n    print("Odd")	71	ERROR		  File "script.py", line 4\n    else\n       ^\nSyntaxError: invalid syntax\n	0.024	2026-02-20 18:29:02.785336
962	3	\N	a = int(input())\nif a % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")	71	ACCEPTED	Odd\n		0.024	2026-02-20 18:29:08.792455
963	3	\N	a = int(input())\nif a % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")	71	ACCEPTED			0.023	2026-02-20 18:29:10.354321
974	3	\N	#include <bits/c++.h>\n\nint main()\n{\n    int a,b,c;\n    std::cin >> a >> b >> c;\n    std::cout << std::max(a,std::max(b,c));\n}	54	ERROR		main.cpp:1:10: fatal error: bits/c++.h: No such file or directory\n    1 | #include <bits/c++.h>\n      |          ^~~~~~~~~~~~\ncompilation terminated.\n	\N	2026-02-20 18:35:33.395168
964	3	\N	#include <iostream>\n\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:30:06.723742
965	3	\N	#include <iostream>\n\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:30:13.42954
979	3	\N	# Read number of elements\nN = int(input().strip())\n\n# Read N integers (space-separated)\nnumbers = list(map(int, input().split()))\n\n# Print their sum\nprint(sum(numbers))	71	ERROR	1\n	Error on Test Case 1	0	2026-02-20 18:39:47.824819
966	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:30:33.162181
975	3	\N	#include <bits/stdc++.h>\n\nint main()\n{\n    int a,b,c;\n    std::cin >> a >> b >> c;\n    std::cout << std::max(a,std::max(b,c));\n}	54	ACCEPTED			0.007	2026-02-20 18:35:48.62588
967	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:30:34.528934
968	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:30:36.885937
969	3	\N	print("Hello world")	71	ERROR	Hello world\n	Error on Test Case 1	0	2026-02-20 18:30:48.99599
976	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    if(n == 0) {\n        cout << 0;\n        return 0;\n    }\n    if(n == 1) {\n        cout << 1;\n        return 0;\n    }\n\n    long long a = 0, b = 1, c;\n\n    for(int i = 2; i <= n; i++) {\n        c = a + b;\n        a = b;\n        b = c;\n    }\n\n    cout << b;\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-20 18:37:09.707259
970	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	FAILED	\N	Cannot read properties of undefined (reading 'id')	\N	2026-02-20 18:31:06.414451
971	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	ERROR		Error on Test Case 1	0	2026-02-20 18:33:13.0654
983	3	\N	#include <iostream>\n#include <climits>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    int num;\n    int minimum = INT_MAX;\n\n    for(int i = 0; i < N; i++) {\n        cin >> num;\n        if(num < minimum) {\n            minimum = num;\n        }\n    }\n\n    cout << minimum;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-20 18:40:46.888452
972	3	\N	#include <iostream>\n#include <string> \nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	ERROR		Error on Test Case 1	0	2026-02-20 18:33:15.15186
977	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    string str;\n    getline(cin, str);\n\n    int count = 0;\n\n    for(char ch : str) {\n        ch = tolower(ch);   // make it case-insensitive\n        if(ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {\n            count++;\n        }\n    }\n\n    cout << count;\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-20 18:39:08.091685
973	3	\N	#include <iostream>\n#include <string> \n#include <algorithm>\nint main()\n{\n    std::string str;\n    std::cin >> str;\n    std::reverse(str.begin(), str.end());\n    std::cout << str;\n}	54	ACCEPTED			0.008	2026-02-20 18:33:31.657825
980	3	\N	# Read number of elements\nN = int(input().strip())\n\n# Read N integers (space-separated)\nnumbers = list(map(int, input().split()))\n\n# Print their sum\nprint(sum(numbers))	71	ERROR	1\n	Error on Test Case 1	0	2026-02-20 18:39:58.103348
978	3	\N	# Input from user\ntext = input().strip()\n\n# Check palindrome\nif text == text[::-1]:\n    print("Yes")\nelse:\n    print("No")	71	ACCEPTED			0.025	2026-02-20 18:39:33.554874
981	3	\N	# Read number of elements\nN = int(input().strip())\n\n# Read N integers\nnumbers = list(map(int, input().split()))\n\n# Print minimum element\nprint(min(numbers))	71	ERROR	5\n	Error on Test Case 1	0	2026-02-20 18:40:15.35341
985	3	\N	#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    double P, R, T;\n    \n    cin >> P;\n    cin >> R;\n    cin >> T;\n\n    double SI = (P * R * T) / 100.0;\n\n    cout << floor(SI);\n\n    return 0;\n}	54	ACCEPTED			0.008	2026-02-20 18:41:17.862356
982	3	\N	# Read number of elements\nN = int(input().strip())\n\n# Read N integers\nnumbers = list(map(int, input().split()))\n\n# Print minimum element\nprint(min(numbers))	71	ERROR	5\n	Error on Test Case 1	0	2026-02-20 18:40:17.303167
984	3	\N	#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    if (n < 0) {\n        cout << "No";\n        return 0;\n    }\n\n    long long root = sqrt(n);\n\n    if (root * root == n)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-20 18:41:02.287704
986	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    for(int i = 1; i <= N; i++) {\n        cout << i;\n        if(i < N) {\n            cout << " ";\n        }\n    }\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-20 18:41:53.177424
987	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n\n    if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0))\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-20 18:42:05.835847
988	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n\n    if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0))\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-20 18:42:20.631162
989	3	\N	a=int(input())\nb=int(input())\nprint(a+b)	71	ACCEPTED	3\n		0.03	2026-02-21 04:10:04.475187
990	3	\N	a=int(input())\nb=int(input())\nprint(a+b)	71	ACCEPTED			0.022	2026-02-21 04:10:06.395092
991	3	\N	n=int(input())\nif(n%2==1):print("Odd")\nelse: print("Even")	71	ACCEPTED	Odd\n		0.022	2026-02-21 04:11:34.255772
992	3	\N	n=int(input())\nif(n%2==1):print("Odd")\nelse: print("Even")	71	ACCEPTED			0.022	2026-02-21 04:11:36.28898
1001	3	\N	w=["hello","leetcode"];o="hlabcdefgijkmnopqrstuvwxyz"\nm={c:i for i,c in enumerate(o)}\nprint(str(all([m[c]for c in a]<=[m[c]for c in b]for a,b in zip(w,w[1:]))).lower())	71	ACCEPTED			0.02	2026-02-21 05:09:20.511264
993	3	\N	n=int(input())\na,b=0,1\nfor _ in range(n):a,b=b,a+b\nprint(a)	71	ACCEPTED	1\n		0.021	2026-02-21 04:17:02.012174
994	3	\N	n=int(input())\na,b=0,1\nfor _ in range(n):a,b=b,a+b\nprint(a)	71	ACCEPTED			0.022	2026-02-21 04:17:03.434995
1015	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << b << " " << a\n    return 0;\n}\n	54	ERROR			\N	2026-02-24 16:14:13.040631
995	3	\N	s=input().lower()\nprint(sum(c in 'aeiou' for c in s))	71	ACCEPTED			0.024	2026-02-21 04:17:59.762052
1002	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nstring expand(string s, int left, int right) {\n    while(left >= 0 && right < s.size() && s[left] == s[right]) {\n        left--;\n        right++;\n    }\n    return s.substr(left + 1, right - left - 1);\n}\n\nstring longestPalindrome(string s) {\n    if(s.empty()) return "";\n    \n    string longest = "";\n    \n    for(int i = 0; i < s.size(); i++) {\n        // Odd length palindrome\n        string odd = expand(s, i, i);\n        \n        // Even length palindrome\n        string even = expand(s, i, i + 1);\n        \n        if(odd.size() > longest.size())\n            longest = odd;\n            \n        if(even.size() > longest.size())\n            longest = even;\n    }\n    \n    return longest;\n}\n\nint main() {\n    string s = "babad";\n    cout << longestPalindrome(s);\n}	54	ACCEPTED			0.006	2026-02-21 05:30:16.856484
996	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-21 05:06:40.557167
997	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nbool isAlienSorted(vector<string>& words, string order) {\n    unordered_map<char, int> rank;\n    \n    // Step 1: Create rank map\n    for(int i = 0; i < order.size(); i++) {\n        rank[order[i]] = i;\n    }\n    \n    // Step 2: Compare adjacent words\n    for(int i = 0; i < words.size() - 1; i++) {\n        string w1 = words[i];\n        string w2 = words[i + 1];\n        \n        int len = min(w1.size(), w2.size());\n        bool foundDifference = false;\n        \n        for(int j = 0; j < len; j++) {\n            if(w1[j] != w2[j]) {\n                if(rank[w1[j]] > rank[w2[j]])\n                    return false;\n                foundDifference = true;\n                break;\n            }\n        }\n        \n        // Edge case: prefix case\n        if(!foundDifference && w1.size() > w2.size())\n            return false;\n    }\n    \n    return true;\n}\n\nint main() {\n    vector<string> words = {"hello", "leetcode"};\n    string order = "hlabcdefgijkmnopqrstuvwxyz";\n    \n    cout << (isAlienSorted(words, order) ? "true" : "false");\n}	54	ACCEPTED			0.007	2026-02-21 05:08:03.942231
1008	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    vector<int>v(n);\n    int sum=0;\n    for(int i=0;i<n;i++)\n    {\n        cin >> v[i];\n        sum+=v[i];\n    }\n    cout << sum;\n\n}	54	ACCEPTED	0		0.041	2026-02-24 07:53:02.840755
998	3	\N	w=["hello","leetcode"];o="hlabcdefgijkmnopqrstuvwxyz"\nm={c:i for i,c in enumerate(o)}\nprint(all([m[c]for c in a]<=[m[c]for c in b]for a,b in zip(w,w[1:])))\n	71	ACCEPTED	True\n		0.022	2026-02-21 05:08:27.05892
1003	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-21 08:33:34.458333
999	3	\N	w=["hello","leetcode"];o="hlabcdefgijkmnopqrstuvwxyz"\nm={c:i for i,c in enumerate(o)}\nprint(all([m[c]for c in a]<=[m[c]for c in b]for a,b in zip(w,w[1:])))\n	71	ERROR	True\n	Error on Test Case 1	0	2026-02-21 05:08:31.758657
1000	3	\N	w=["hello","leetcode"];o="hlabcdefgijkmnopqrstuvwxyz"\nm={c:i for i,c in enumerate(o)}\nprint(str(all([m[c]for c in a]<=[m[c]for c in b]for a,b in zip(w,w[1:]))).lower())	71	ACCEPTED			0.021	2026-02-21 05:08:58.085151
1011	1	\N	public class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc=new Scanner(System.in);\n     int i;\n     if(i%2==0){\n        System.out.println("Even");\n     }        \n        else\n        System.out.println("Odd");\n    }\n}	62	ERROR		Main.java:5: error: cannot find symbol\n        Scanner sc=new Scanner(System.in);\n        ^\n  symbol:   class Scanner\n  location: class Main\nMain.java:5: error: cannot find symbol\n        Scanner sc=new Scanner(System.in);\n                       ^\n  symbol:   class Scanner\n  location: class Main\n2 errors\n	\N	2026-02-24 07:54:20.668131
1004	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-21 08:33:37.195502
1009	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    vector<int>v(n);\n    int sum=0;\n    for(int i=0;i<n;i++)\n    {\n        cin >> v[i];\n        sum+=v[i];\n    }\n    cout << sum;\n\n}	54	ACCEPTED	18		0.005	2026-02-24 07:53:11.313602
1005	3	\N	p=int(input())\nr=int(input())\nt=int(input())\nprint(int((p*r*t)/100))	71	ERROR		Traceback (most recent call last):\n  File "script.py", line 1, in <module>\n    p=int(input())\nEOFError: EOF when reading a line\n	0.022	2026-02-21 08:34:53.397097
1006	3	\N	p=int(input())\nr=int(input())\nt=int(input())\nprint(int((p*r*t)/100))	71	ACCEPTED	2\n		0.02	2026-02-21 08:35:07.220278
1007	3	\N	p=int(input())\nr=int(input())\nt=int(input())\nprint(int((p*r*t)/100))	71	ACCEPTED			0.022	2026-02-21 08:35:12.436095
1010	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main()\n{\n    int n;\n    cin >> n;\n    vector<int>v(n);\n    int sum=0;\n    for(int i=0;i<n;i++)\n    {\n        cin >> v[i];\n        sum+=v[i];\n    }\n    cout << sum;\n\n}	54	ACCEPTED			0.006	2026-02-24 07:53:14.209802
1013	1	\N	s = input().strip()\nprint(s[::-1])	71	ACCEPTED			0.031	2026-02-24 08:15:00.201901
1012	1	\N	import java.util.*;\npublic class Main\n{\n    public static void main(String[] args)\n    {\n        Scanner sc=new Scanner(System.in);\n     int i = sc.nextInt();\n     if(i%2==0){\n        System.out.println("Even");\n     }        \n        else\n        System.out.println("Odd");\n    }\n}	62	ACCEPTED			0.106	2026-02-24 07:54:44.101357
1014	1	\N	a = int(input())\nb = int(input())\nc = int(input())\n\nprint(max(a, b, c))	71	ACCEPTED			0.024	2026-02-24 08:15:14.966105
1016	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << b << " " << a\n    return 0;\n}\n	54	ERROR			\N	2026-02-24 16:14:19.153799
1017	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << b << " " << a\n    return 0;\n}\n	54	ERROR		Error on Test Case 1	0	2026-02-24 16:14:21.527125
1018	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << b << " " << a;\n    return 0;\n}\n	54	ACCEPTED	2 1		0.007	2026-02-24 16:14:33.156266
1019	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << b << " " << a;\n    return 0;\n}\n	54	ACCEPTED			0.006	2026-02-24 16:14:35.971196
1020	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:37.296045
1021	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:38.54215
1022	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:39.315656
1023	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:39.498408
1024	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:39.702016
1025	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:39.882514
1026	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:57:44.89225
1047	3	\N	from collections import deque\n\ngraph = [[1, 2], [0, 3], [0, 3], [1, 2]]\nA = 0\nB = 3\n\ndef shortest_path(graph, A, B):\n    n = len(graph)\n    visited = [False] * n\n    q = deque()\n\n    q.append((A, 0))  # (node, distance)\n    visited[A] = True\n\n    while q:\n        node, dist = q.popleft()\n\n        if node == B:\n            return dist\n\n        for nei in graph[node]:\n            if not visited[nei]:\n                visited[nei] = True\n                q.append((nei, dist + 1))\n\n    return -1\n\nprint(shortest_path(graph, A, B))	71	ACCEPTED			0.026	2026-02-24 19:06:43.656728
1027	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:39.819936
1028	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:40.705309
1051	3	\N	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n\n    int i = 0, j = s.length() - 1;\n\n    while (i < j) {\n        if (s[i] != s[j]) {\n            cout << "No";\n            return 0;\n        }\n        i++;\n        j--;\n    }\n\n    cout << "Yes";\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-24 19:08:01.584086
1029	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:41.755767
1048	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    int x, mn;\n    cin >> mn;  // first element\n\n    for (int i = 1; i < n; i++) {\n        cin >> x;\n        if (x < mn)\n            mn = x;\n    }\n\n    cout << mn;\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-24 19:07:05.222696
1030	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:42.538445
1031	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:45.972461
1032	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:46.498616
1049	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n <= 1) {\n        cout << "No";\n        return 0;\n    }\n\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) {\n            cout << "No";\n            return 0;\n        }\n    }\n\n    cout << "Yes";\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-24 19:07:29.738988
1033	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:46.699204
1034	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:46.888828
1035	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 18:59:47.106284
1050	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n\n    cout << n * n * n;\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-24 19:07:43.297393
1036	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 19:00:02.908
1037	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 19:00:10.670277
1038	3	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 19:00:13.729507
1052	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    char ch;\n    cin >> ch;\n\n    // convert lowercase to uppercase\n    ch = ch - ('a' - 'A');\n\n    cout << ch;\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-24 19:08:16.122838
1039	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 19:00:16.694634
1040	3	\N		71	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-24 19:00:17.218505
1080	3	\N	#include <iostream>\n#include <string>\nusing namespace std;\n\n// Count Vowels\n\nint main() {\n    string s;\n    getline(cin, s);\n\n    int count = 0;\n\n    for (char ch : s) {\n        ch = tolower(ch);\n        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {\n            count++;\n        }\n    }\n\n    cout << count;\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-25 15:57:20.090173
1041	3	\N	# Type your code here\n	71	ACCEPTED			0.03	2026-02-24 19:03:13.32931
1053	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n % 3 == 0 && n % 5 == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-24 19:08:30.417225
1042	3	\N	# Type your code here\n	71	ERROR		Error on Test Case 1	0	2026-02-24 19:03:15.232893
1043	3	\N	# Type your code here\nprint("HIII")	71	ACCEPTED	HIII\n		0.021	2026-02-24 19:03:21.293611
1044	3	\N	length = int(input())\nwidth = int(input())\n\narea = length * width\nprint(area)	71	ACCEPTED			0.022	2026-02-24 19:04:40.383944
1082	3	\N	#include <iostream>\nusing namespace std;\n\n// Divisible by 3 and 5\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n % 3 == 0 && n % 5 == 0)\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-25 15:57:45.376717
1045	3	\N	age = int(input())\n\nif age >= 18:\n    print("Eligible")\nelse:\n    print("Not Eligible")	71	ACCEPTED			0.023	2026-02-24 19:05:00.481445
1081	3	\N	#include <iostream>\nusing namespace std;\n\n// Celsius to Fahrenheit\n\nint main() {\n    int c;\n    cin >> c;\n\n    int f = (c * 9 / 5) + 32;\n\n    cout << f;\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-25 15:57:33.611384
1046	3	\N	n = int(input())\n\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")	71	ACCEPTED			0.023	2026-02-24 19:06:11.978831
1054	3	\N	#include <iostream>\n#include <string>\nusing namespace std;\n\nstring longestPalindrome(string s) {\n    int n = s.length();\n    if (n == 0) return "";\n\n    int start = 0, maxLen = 1;\n\n    // expand around center\n    for (int i = 0; i < n; i++) {\n\n        // odd length palindrome\n        int l = i, r = i;\n        while (l >= 0 && r < n && s[l] == s[r]) {\n            if (r - l + 1 > maxLen) {\n                start = l;\n                maxLen = r - l + 1;\n            }\n            l--;\n            r++;\n        }\n\n        // even length palindrome\n        l = i;\n        r = i + 1;\n        while (l >= 0 && r < n && s[l] == s[r]) {\n            if (r - l + 1 > maxLen) {\n                start = l;\n                maxLen = r - l + 1;\n            }\n            l--;\n            r++;\n        }\n    }\n\n    return s.substr(start, maxLen);\n}\n\nint main() {\n    string s = "babad";\n    cout << longestPalindrome(s);\n    return 0;\n}	54	ACCEPTED			0.005	2026-02-24 19:08:48.248244
1075	3	\N	#include <iostream>\nusing namespace std;\n\n// Find Minimum Element\n\nint main() {\n    int n;\n    cin >> n;\n\n    int x, minVal;\n    cin >> minVal;  // first element\n\n    for (int i = 1; i < n; i++) {\n        cin >> x;\n        if (x < minVal) {\n            minVal = x;\n        }\n    }\n\n    cout << minVal;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:50:00.029634
1055	3	\N	#include <iostream>\nusing namespace std;\n\nint main() {\n    char ch;\n    cin >> ch;\n\n    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-24 19:09:07.818865
1064	3	\N	# Factorial of a Number\n\nn = int(input())\n\nfactorial = 1\n\nfor i in range(1, n + 1):\n    factorial *= i\n\nprint(factorial)	71	ACCEPTED			0.025	2026-02-25 15:42:35.393551
1056	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n    return 0;\n}\n	54	ACCEPTED	3		0.005	2026-02-25 15:36:55.24323
1057	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-25 15:36:57.753603
1071	3	\N	# Count Vowels\n\ns = input().lower()\n\ncount = 0\nvowels = "aeiou"\n\nfor ch in s:\n    if ch in vowels:\n        count += 1\n\nprint(count)	71	ACCEPTED			0.02	2026-02-25 15:48:09.564955
1058	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n    return 0;\n}\n	54	ACCEPTED			0.006	2026-02-25 15:37:11.826588
1065	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int a,b;\n    std::cin >> a >> b;\n    std::cout << (a+b);\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-25 15:46:14.397399
1059	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Type your code here\n    return 0;\n}\n	54	ERROR		Error on Test Case 1	0	2026-02-25 15:37:29.593983
1060	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    std::cin >> n;\n    if(n%2==0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n    return 0;\n}\n	54	ACCEPTED	Odd		0.005	2026-02-25 15:39:38.545377
1061	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    std::cin >> n;\n    if(n%2==0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-25 15:39:40.768718
1066	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    std::cin >> n;\n    if(n%2==0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-25 15:46:40.929938
1062	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    std::cin >> n;\n    if(n%2==0)\n    {\n        std::cout << "Even";\n    }\n    else\n    {\n        std::cout << "Odd";\n    }\n    return 0;\n}\n	54	ACCEPTED			0.007	2026-02-25 15:39:49.103411
1063	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Type your code here\n    return 0;\n}\n	54	ERROR		Error on Test Case 1	0	2026-02-25 15:39:55.030603
1067	3	\N	# Factorial of a Number\n\nn = int(input())\n\nfactorial = 1\n\nfor i in range(1, n + 1):\n    factorial *= i\n\nprint(factorial)	71	ACCEPTED			0.021	2026-02-25 15:46:54.598746
1072	3	\N	# Palindrome Check\n\ns = input()\n\nif s == s[::-1]:\n    print("Yes")\nelse:\n    print("No")	71	ACCEPTED			0.025	2026-02-25 15:48:25.653114
1068	3	\N	# Reverse a String\n\ns = input()\n\nprint(s[::-1])	71	ACCEPTED			0.027	2026-02-25 15:47:15.727778
1069	3	\N	# Find Maximum of Three\n\na = int(input())\nb = int(input())\nc = int(input())\n\nprint(max(a, b, c))	71	ACCEPTED			0.028	2026-02-25 15:47:33.789067
1077	3	\N	#include <iostream>\nusing namespace std;\n\n// Leap Year Check\n\nint main() {\n    int year;\n    cin >> year;\n\n    if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0))\n        cout << "Yes";\n    else\n        cout << "No";\n\n    return 0;\n}	54	ACCEPTED			0.008	2026-02-25 15:51:54.088841
1070	3	\N	# Fibonacci Sequence (0-indexed)\n\nn = int(input())\n\na, b = 0, 1\n\nfor _ in range(n):\n    a, b = b, a + b\n\nprint(a)	71	ACCEPTED			0.028	2026-02-25 15:47:55.085121
1073	3	\N	# Sum of Array Arguments\n\nn = int(input())\n\narr = list(map(int, input().split()))\n\nprint(sum(arr))	71	ERROR	1\n	Error on Test Case 1	0	2026-02-25 15:48:40.158713
1076	3	\N	#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Type your code here\n    return 0;\n}\n	54	ERROR		Error on Test Case 1	0	2026-02-25 15:50:43.585017
1074	3	\N	# Sum of Array Arguments\n\nn = int(input())\n\narr = list(map(int, input().split()))\n\nprint(sum(arr))	71	ERROR	1\n	Error on Test Case 1	0	2026-02-25 15:48:42.411154
1078	3	\N	#include <iostream>\nusing namespace std;\n\n// Find Minimum Element\n\nint main() {\n    int n;\n    cin >> n;\n\n    int x, minElement;\n    cin >> minElement; // read first element\n\n    for (int i = 1; i < n; i++) {\n        cin >> x;\n        if (x < minElement) {\n            minElement = x;\n        }\n    }\n\n    cout << minElement;\n\n    return 0;\n}	54	ACCEPTED			0.004	2026-02-25 15:56:55.726029
1079	3	\N	#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// Asteroid Mining Optimization\n\nint main() {\n    int n;\n    cin >> n;\n\n    vector<int> asteroids(n);\n    for (int i = 0; i < n; i++) {\n        cin >> asteroids[i];\n    }\n\n    int k;\n    cin >> k;\n\n    // Destroy smaller asteroids first (greedy)\n    sort(asteroids.begin(), asteroids.end());\n\n    int count = 0;\n\n    for (int mass : asteroids) {\n        if (k >= mass) {\n            k -= mass;\n            count++;\n        } else {\n            break;\n        }\n    }\n\n    cout << count;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:57:08.738095
1088	3	\N	#include <iostream>\nusing namespace std;\n\n// Uppercase Conversion\n\nint main() {\n    char ch;\n    cin >> ch;\n\n    ch = ch - 32;   // convert lowercase to uppercase (ASCII)\n\n    cout << ch;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:59:39.982111
1083	3	\N	#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\n// Alien Language Validation\n\nbool inCorrectOrder(string &a, string &b,\n                    unordered_map<char, int> &rank) {\n\n    int n = min(a.size(), b.size());\n\n    for (int i = 0; i < n; i++) {\n        if (a[i] != b[i])\n            return rank[a[i]] < rank[b[i]];\n    }\n\n    // If all characters match, shorter word should come first\n    return a.size() <= b.size();\n}\n\nint main() {\n    int n;\n    cin >> n;\n\n    vector<string> words(n);\n    for (int i = 0; i < n; i++)\n        cin >> words[i];\n\n    string order;\n    cin >> order;\n\n    unordered_map<char, int> rank;\n\n    // store alien alphabet order\n    for (int i = 0; i < order.size(); i++)\n        rank[order[i]] = i;\n\n    bool valid = true;\n\n    for (int i = 0; i < n - 1; i++) {\n        if (!inCorrectOrder(words[i], words[i + 1], rank)) {\n            valid = false;\n            break;\n        }\n    }\n\n    cout << (valid ? "true" : "false");\n\n    return 0;\n}	54	ACCEPTED			0.006	2026-02-25 15:58:04.423416
1084	3	\N	#include <iostream>\nusing namespace std;\n\n// Check Even or Odd\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n % 2 == 0)\n        cout << "Even";\n    else\n        cout << "Odd";\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:58:16.806028
1094	3	\N	#include <iostream>\nusing namespace std;\n\n// Check Even or Odd\n\nint main() {\n    int n;\n    cin >> n;\n\n    if (n % 2 == 0)\n        cout << "Even";\n    else\n        cout << "Odd";\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 16:48:25.470284
1085	3	\N	#include <iostream>\nusing namespace std;\n\n// Sum of Array Arguments\n\nint main() {\n    int n;\n    cin >> n;\n\n    long long sum = 0, x;\n\n    for (int i = 0; i < n; i++) {\n        cin >> x;\n        sum += x;\n    }\n\n    cout << sum;\n\n    return 0;\n}	54	ACCEPTED			0.005	2026-02-25 15:58:46.924455
1089	3	\N	#include <iostream>\nusing namespace std;\n\n// Area of Rectangle\n\nint main() {\n    int length, width;\n    cin >> length >> width;\n\n    cout << length * width;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:59:52.95465
1086	3	\N	#include <iostream>\nusing namespace std;\n\n// Print 1 to N\n\nint main() {\n    int n;\n    cin >> n;\n\n    for (int i = 1; i <= n; i++) {\n        cout << i << " ";\n    }\n\n    return 0;\n}	54	ACCEPTED			0.008	2026-02-25 15:59:10.126461
1087	3	\N	#include <iostream>\n#include <cmath>\nusing namespace std;\n\n// Simple Interest\n\nint main() {\n    double principal, rate, time;\n    cin >> principal >> rate >> time;\n\n    double si = (principal * rate * time) / 100.0;\n\n    cout << (long long)floor(si);\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 15:59:23.698188
1090	3	\N	#include <iostream>\nusing namespace std;\n\n// Check Voting Age\n\nint main() {\n    int age;\n    cin >> age;\n\n    if (age >= 18)\n        cout << "Eligible";\n    else\n        cout << "Not Eligible";\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 16:00:04.429341
1095	3	\N	#include <iostream>\nusing namespace std;\n\n// Factorial of a Number\n\nint main() {\n    int n;\n    cin >> n;\n\n    long long factorial = 1;\n\n    for (int i = 1; i <= n; i++) {\n        factorial *= i;\n    }\n\n    cout << factorial;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 16:48:38.380914
1091	3	\N	#include <iostream>\nusing namespace std;\n\n// Fibonacci Sequence (0-indexed)\n\nint main() {\n    int n;\n    cin >> n;\n\n    long long a = 0, b = 1;\n\n    for (int i = 0; i < n; i++) {\n        long long temp = a + b;\n        a = b;\n        b = temp;\n    }\n\n    cout << a;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 16:00:21.301349
1092	3	\N	#include <iostream>\nusing namespace std;\n\n// Cube of Number\n\nint main() {\n    long long n;\n    cin >> n;\n\n    cout << n * n * n;\n\n    return 0;\n}	54	ACCEPTED			0.007	2026-02-25 16:00:32.463357
1093	3	\N	#include <iostream>\nusing namespace std;\n\n// Sum of Two Numbers\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n\n    cout << a + b;\n\n    return 0;\n}	54	ACCEPTED			0.008	2026-02-25 16:48:12.664075
1096	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-25 17:04:56.692922
1097	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-25 17:04:57.570498
1098	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-25 17:04:58.362906
1099	1	\N		54	FAILED	\N	{"source_code":["can't be blank"]}	\N	2026-02-25 17:04:59.473613
1100	1	\N	c = float(input())\nf = (c * 9 / 5) + 32\nprint(int(f))	71	ACCEPTED			0.023	2026-02-25 17:26:59.254276
1101	1	\N	# Type your code here\n	71	ERROR		Error on Test Case 1	0	2026-02-25 17:27:04.965247
\.


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
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
104	31	2\nhello\nleetcode\nhlabcdefgijkmnopqrstuvwxyz	true\n	f
105	32	4\n1 2\n0 3\n0 3\n1 2\n0\n3	2\n	f
106	33	abcde\nace	3\n	f
107	34	5\n1 2 3 4 5\n7	3\n	f
108	35	babad	bab\n	f
\.


--
-- Data for Name: user_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_questions (id, user_id, question_id, status, start_time, sequence_order, score_awarded) FROM stdin;
21	1	10	TIMEOUT	2026-02-25 17:16:39.029844+00	5	0
1	3	11	ACCEPTED	2026-02-25 15:56:35.927+00	0	14
22	1	27	TIMEOUT	2026-02-25 17:19:40.912743+00	6	0
2	3	34	ACCEPTED	2026-02-25 15:56:58.549945+00	1	15
23	1	17	TIMEOUT	2026-02-25 17:22:42.995977+00	7	0
3	3	8	ACCEPTED	2026-02-25 15:57:10.77339+00	2	15
4	3	16	ACCEPTED	2026-02-25 15:57:22.954208+00	3	15
24	1	16	ACCEPTED	2026-02-25 17:25:43.309091+00	8	13
5	3	28	ACCEPTED	2026-02-25 15:57:36.604075+00	4	15
25	1	13	TIMEOUT	2026-02-25 17:27:01.388536+00	9	0
6	3	31	ACCEPTED	2026-02-25 15:57:48.250624+00	5	15
26	1	28	TIMEOUT	2026-02-25 17:30:02.894617+00	10	0
27	1	24	TIMEOUT	2026-02-25 17:33:05.293258+00	11	0
28	1	25	TIMEOUT	2026-02-25 17:36:08.601712+00	12	0
8	3	10	ACCEPTED	2026-02-25 15:58:19.682994+00	7	14
29	1	14	TIMEOUT	2026-02-25 17:39:11.552213+00	13	0
9	3	14	ACCEPTED	2026-02-25 15:58:49.766805+00	8	14
30	1	20	unsolved	2026-02-25 17:42:14.545952+00	14	0
10	3	13	ACCEPTED	2026-02-25 15:59:12.996075+00	9	15
11	3	22	ACCEPTED	2026-02-25 15:59:26.671876+00	10	15
12	3	19	ACCEPTED	2026-02-25 15:59:42.844398+00	11	15
13	3	30	ACCEPTED	2026-02-25 15:59:56.020224+00	12	15
14	3	7	ACCEPTED	2026-02-25 16:00:07.33994+00	13	15
15	3	21	ACCEPTED	2026-02-25 16:00:24.215717+00	14	15
7	3	2	ACCEPTED	2026-02-25 15:58:06.596843+00	6	15
16	1	4	TIMEOUT	2026-02-25 17:01:31.28+00	0	0
17	1	11	TIMEOUT	2026-02-25 17:04:30.990217+00	1	0
18	1	31	TIMEOUT	2026-02-25 17:07:32.256455+00	2	0
19	1	9	TIMEOUT	2026-02-25 17:10:35.189913+00	3	0
20	1	1	TIMEOUT	2026-02-25 17:13:37.309417+00	4	0
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, socket_id, join_time, end_time) FROM stdin;
1	3	\N	2026-02-25 15:56:35.927+00	2026-02-25 16:41:35.927+00
2	1	\N	2026-02-25 17:01:31.28+00	2026-02-25 17:46:31.28+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, token, team_name, rapidfire_score, cascade_score, dsa_score) FROM stdin;
1	demo	DEMO123	RapidFire Squad	13	0	0
2	tej	HAHA123	Pixel Pioneers	0	0	0
3	tigercharan	TEJ123	Venkata Broker	222	36	0
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attempts_id_seq', 1, false);


--
-- Name: cascade_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cascade_sessions_id_seq', 2, true);


--
-- Name: dsa_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dsa_sessions_id_seq', 1, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 35, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 1101, true);


--
-- Name: test_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_cases_id_seq', 108, true);


--
-- Name: user_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_questions_id_seq', 30, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: attempts attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);


--
-- Name: cascade_sessions cascade_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_sessions
    ADD CONSTRAINT cascade_sessions_pkey PRIMARY KEY (id);


--
-- Name: cascade_user_questions cascade_user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: dsa_sessions dsa_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_sessions
    ADD CONSTRAINT dsa_sessions_pkey PRIMARY KEY (id);


--
-- Name: dsa_user_questions dsa_user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: round_control round_control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_control
    ADD CONSTRAINT round_control_pkey PRIMARY KEY (round_name);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: user_questions user_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_token_key UNIQUE (token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: attempts attempts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: attempts attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cascade_sessions cascade_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_sessions
    ADD CONSTRAINT cascade_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cascade_user_questions cascade_user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: cascade_user_questions cascade_user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cascade_user_questions
    ADD CONSTRAINT cascade_user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsa_sessions dsa_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_sessions
    ADD CONSTRAINT dsa_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsa_user_questions dsa_user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: dsa_user_questions dsa_user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dsa_user_questions
    ADD CONSTRAINT dsa_user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_questions user_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: user_questions user_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_questions
    ADD CONSTRAINT user_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vrhzLFizgb7Y4pFNezhxvICPkKmAKQMJ6t8ZYufVUUsM4AKZBYPf9l9qvul7nGu

