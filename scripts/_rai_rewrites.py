#!/usr/bin/env python3
"""One-off: rewrite wrong choices for reliable-ai-systems quizzes (length balance)."""
from __future__ import annotations

import importlib.util
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("s", ROOT / "scripts" / "_scan-quiz-length-bias.py")
s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)

DIR = ROOT / "fundamentals" / "scalable-systems" / "reliable-ai-systems"
POS = [2, 0, 3, 1, 1, 3, 0, 2]

W = {
    ("01", 1): [
        "Reasoning models require temperature to be an integer such as 0 or 1, so fractional values like 0.3 are rejected",
        "Temperature is only honored when streaming is enabled, so non-streaming calls with that parameter always error out",
        "The API key lacks permission for sampling controls, and the provider rejects any request that sets them",
    ],
    ("01", 2): [
        "A commercial API model hosted by the vendor, protected by a strict data-processing agreement and encryption",
        "The largest frontier model available, since bigger models are better at keeping patient data confidential",
        "Any model run at temperature 0, because deterministic decoding stops patient text from being retained",
    ],
    ("01", 3): [
        "High temperature (e.g. 1.2-1.5) with top_p at 0.95, so each answer explores varied but plausible phrasing",
        "A high presence penalty plus an unlimited token budget, so the model avoids repeating earlier wording",
        "Default temperature with a large top_k and a freshly random seed on every request, for diversity",
    ],
    ("01", 4): [
        "True, because greedy decoding always picks the most likely token, and the most likely token is by definition the factually correct one",
        "True for hosted APIs, since temperature 0 switches on the provider's built-in fact checking before any token is returned to you",
        "False, because temperature 0 is rejected by most APIs, so you can only approach determinism by lowering top_p instead",
    ],
    ("01", 6): [
        "Counter only counts integers, so passing it a list of strings raises a type error before any vote is tallied",
        "Voting only works when you have at least 100 samples, and five completions are far too few to produce a majority",
        "Counter sorts strings alphabetically rather than by frequency, so the first answer in order always wins the vote",
    ],
    ("01", 7): [
        "Raise the temperature so the model explores more creative interpretations of unfamiliar words",
        "Tree-of-thought search: branch over many candidate readings and score each with a separate judge",
        "Increase max_tokens so the model has enough room to figure out the slang on its own",
    ],
    ("01", 8): [
        "Remove the examples entirely, since few-shot demonstrations only confuse a model that cannot reason",
        "Raise the presence penalty so the model stops repeating its earlier reasoning and tries a different path",
        "Shorten the stop sequence so generation cuts off before the model can talk itself into a wrong answer",
    ],
    ("01", 9): [
        "Zero-shot prompting: ask once with no examples and treat a fluent answer as a confident one",
        "Lower top-p only: narrower sampling makes the output less random and so signals certainty",
        "Remove the system prompt so the model has no instructions to hide its uncertainty behind",
    ],
    ("01", 11): [
        "It updates the model's weights with the latest data each time, so its training knowledge is always current",
        "It forces the temperature to 0 for every call, which guarantees the model recalls facts accurately",
        "It removes the need for a prompt, because the tool's schema alone tells the model how to answer",
    ],
    ("01", 12): [
        "Guess that \"city\" means \"location\", silently remap the argument, and run the tool without telling the model",
        "Crash the whole request with an unhandled exception so that the failure shows up clearly in the logs",
        "Discard the tool call and answer from the model's own memory, without telling the user",
    ],
    ("02", 1): [
        "Fine-tuning on product data is prohibited by most providers' terms, so inventory facts can never be placed into a model's weights in the first place",
        "Fine-tuned models lose the ability to answer questions, because training on one month of data overwrites their general conversational skills",
        "Inventory records are too small a dataset to train on effectively, so the model memorizes noise and answers stock questions at random",
    ],
    ("02", 3): [
        "RAG eliminates hallucinations entirely, because every answer is copied from retrieved documents, so no further evaluation or guardrails are needed once retrieval works",
        "RAG makes responses slower and never more accurate, because the extra retrieval step adds latency while the model ignores the retrieved context anyway",
        "RAG only works with OpenAI models, since other providers cannot accept retrieved passages inside their prompts, so grounding in documents is impossible",
    ],
    ("02", 5): [
        "To lower the average score of the system, so that leadership expectations stay realistic about quality",
        "Because real wrong answers are too expensive to collect, so synthetic ones are the only option available",
        "To train the generator to hallucinate less by showing it examples of the unsupported answers to avoid",
    ],
    ("02", 7): [
        "Retrieval pipelines silently delete everything beyond the top 10 documents, so document 15 never reaches the prompt even though 30 were fetched",
        "Document 15 is always the least relevant item, because retrievers return results sorted from most to least useful and the model skips weaker ones",
        "The temperature is set too low, so the model samples only from the first few retrieved passages and never reads material deeper in the prompt",
    ],
    ("02", 8): [
        "BM25 is broken for this corpus, so the keyword scorer silently returns nothing whenever it is combined with any metadata filter at all",
        "The documents are too short to match, because filters need at least several paragraphs of text before metadata can be compared",
        "The embedding model is too small, so it cannot encode the filter values and the vector store rejects every incoming query",
    ],
    ("03", 1): [
        "A commercial embedding API with strong general benchmarks, even though patient text leaves the premises",
        "all-MiniLM-L6-v2 as-is, deployed without any evaluation on clinical vocabulary or retrieval recall",
        "Any embedding model at all, as long as cosine similarity is used to compare the resulting vectors",
    ],
    ("03", 2): [
        "Nothing, since embedding vectors are interchangeable across providers once they share the same dimension count",
        "Re-embed only the new documents going forward, and keep the old vectors because they stay comparable",
        "Convert the old vectors to the new space using cosine similarity, which maps one model's output onto another's",
    ],
    ("03", 3): [
        "Queries are much longer than listings, so embedding them offline would waste storage, while encoding them live stays cheap",
        "Listings cannot be embedded ahead of time because their text changes with every search the user performs, so the work must be repeated",
        "Precomputing listing embeddings avoids needing a vector index, since stored vectors can be scanned directly in the browser",
    ],
    ("03", 4): [
        "More weight on BM25, which improves ordering among documents that were already retrieved in the top 20",
        "Fewer documents in the index, so that fewer candidates compete with the right one for the top positions",
        "A higher LLM temperature, which reshuffles the retrieved candidates until the right one lands near the top",
    ],
    ("03", 5): [
        "They cannot read long documents, so they are restricted to short snippets and are useless on full passages of real text",
        "They only work with BM25 candidates, since their scoring head expects keyword statistics rather than dense vectors as input",
        "They are less accurate than bi-encoders, so the only reason to run them on a few candidates is that they cost less per query",
    ],
    ("03", 6): [
        "RRF is the only fusion method that removes duplicate documents, so it is required whenever two retrievers return the same item",
        "Adding the scores is far too slow at scale, because the two score lists must be sorted together before they can be summed",
        "RRF works without any retrievers present, because it generates its own candidate list straight from the query text",
    ],
    ("03", 7): [
        "It stores far fewer vectors than a flat index, because the graph merges near-duplicates, so both memory use and compute drop with scale",
        "It replaces vector similarity with keyword matching on a layered inverted index, so the query never has to be compared with stored vectors",
        "It runs the distance computations on GPUs only, which parallelizes the full scan so well that cost no longer grows with corpus size",
    ],
    ("03", 8): [
        "Sufficient: FAISS already provides persistence, metadata filtering, and replication out of the box",
        "Only usable together with BM25, which supplies the persistence and replication layers it lacks",
        "Unable to index more than 10K vectors, so 50M vectors is impossible regardless of other features",
    ],
    ("03", 9): [
        "Delete the oldest chunks until memory fits, accepting that some documents will no longer be retrievable at all",
        "Switch from dense retrieval to BM25 only, since keyword indexes never need to hold any embeddings in memory",
        "Use bigger embedding dimensions so that each chunk can be compressed into fewer, denser vectors overall",
    ],
    ("03", 10): [
        "New embedding models are always worse than older ones on every corpus, so mixing the two simply drags retrieval quality down",
        "The vector database now needs more replicas, because two different embedding models double the read load on each index shard",
        "Cosine similarity stops working after any model upgrade, so the index must switch to another metric before searches can succeed",
    ],
    ("04", 2): [
        "Random splits give too few validation examples to be reliable, so accuracy is noisy and happens to overstate quality by a wide margin on small support datasets",
        "Validation sets must always be larger than training sets for accuracy to be meaningful, and random splits almost never reach that ratio in practice",
        "Random splits change the loss function between training and validation, so the two curves are measured on different objectives and cannot be compared",
    ],
    ("04", 3): [
        "Full fine-tuning in fp16, which stores weights, gradients, and optimizer states for every parameter",
        "Full fine-tuning in fp32, which uses double the memory of fp16 but gives the most accurate results",
        "Pretraining from scratch on your own corpus, which fits easily once the batch size is reduced",
    ],
    ("04", 6): [
        "LoRA forgets more of the base model's abilities and also learns more of the new domain than full fine-tuning",
        "They are statistically identical, so the choice between LoRA and full fine-tuning is purely about cost",
        "LoRA cannot be applied to chat models, so full fine-tuning is the only option for conversational use",
    ],
    ("04", 7): [
        "It needs the teacher's full internal probability distributions at every token, which APIs usually expose in full",
        "It requires no training at all, because the student simply copies the teacher's responses at inference time",
        "It makes the student larger than the teacher, since each output is stored as extra parameters in the student",
    ],
    ("04", 8): [
        "Deploy anyway, because matching the teacher on easy prompts shows the distillation has already succeeded",
        "Lower the sampling temperature at inference time, which makes the student reproduce rare cases more reliably",
        "Switch the teacher to a smaller model, so that the student sees simpler outputs that are easier to copy",
    ],
    ("06", 1): [
        "Only in the current prompt, which is discarded after the session, so no privacy obligation arises for the operator",
        "In the model weights via fine-tuning, where it stays private because weights cannot be inspected or extracted",
        "Nowhere: agents must never remember anything between sessions, so preferences should be asked again each time",
    ],
    ("06", 2): [
        "A higher temperature, so the model varies its tool calls and stops repeating the same request",
        "A larger context window, so the agent can hold every earlier call and notice that it is repeating",
        "Summary memory, which compresses past turns so the earlier calls are no longer shown to the model",
    ],
    ("06", 3): [
        "Nothing is wrong: any difference between two sources, however small, is a genuine discrepancy that users should see",
        "It should first average the readings from three or more APIs and then compare only that mean with a fixed threshold",
        "Prices from different APIs can never be cross-referenced, so the check should be removed and one source trusted",
    ],
    ("06", 4): [
        "RAG relies on embeddings for retrieval, while agents never use them and only work from the prompt",
        "Agents never retrieve documents at all, whereas RAG exists only to fetch text from a document store",
        "RAG is always slower, since it must embed and search, while an agent answers in a single model call",
    ],
    ("06", 5): [
        "It slows the agent down noticeably, because scanning every message against a long keyword list adds more latency than an entire model call does",
        "It uses too much memory, since a long list of banned keywords must be reloaded and held separately for every concurrent user session in production",
        "Keywords cannot be lower-cased reliably, so users can bypass the filter by changing capitalization, and no fix exists short of retraining",
    ],
    ("06", 6): [
        "A real heat wave: Paris did reach that temperature, and the tool simply reported it correctly",
        "Floating-point error in the unit conversion, which accumulated enough drift to inflate the value",
        "The LLM hallucinated the number while paraphrasing the tool output, so the tool result itself was fine",
    ],
    ("06", 7): [
        "It is required by the HTTP specification, so any agent that omits tool names breaks compatibility",
        "It makes the model more accurate on its own, because displaying the tool names changes its token probabilities",
        "It reduces the token cost of each reply, because tool names are shorter than the full explanation",
    ],
    ("07", 2): [
        "Authentication and authorization for your backend APIs, including token issuing and per-user permission checks",
        "The business logic inside each tool, so a tool author only has to describe what the tool is meant to do",
        "A guarantee that tools never fail, because the protocol retries every call until it eventually succeeds",
    ],
    ("07", 3): [
        "MCP does not support the HTTP transport at all, so a hosted client can only reach servers through a local stdio subprocess that it starts itself",
        "The port must be 443, because OpenAI's hosted MCP tool refuses every other port number and rejects URLs that name one explicitly",
        "The gpt-4.1-mini model does not support tool calling of any kind, so only larger models can call an MCP server at all, locally or not",
    ],
    ("07", 4): [
        "It scrapes the server's published documentation pages and parses the tool names out of the returned text",
        "The developer hard-codes every tool description into each prompt, because servers cannot report their own tools",
        "It calls GET /tools/list as an ordinary REST endpoint, which returns the tool names as a plain text list",
    ],
    ("07", 5): [
        "Raise the temperature so the model explores both tools more often and eventually learns which one is the better match for each request",
        "Merge them into a single tool called do_thing that accepts a free-form string, so the model cannot pick the wrong one",
        "Remove the descriptions entirely to save tokens, since the model can infer what each tool does from its name and parameter list alone",
    ],
    ("07", 6): [
        "success: false with an error code such as NOT_FOUND, so the model knows that the search itself failed",
        "Raise a Python exception from the tool, so the harness can report an internal error to the model",
        "Return nothing at all, so the model infers from the empty reply that no further search is useful",
    ],
    ("07", 7): [
        "All of them, always, since an immediate retry is harmless and the backoff delay guarantees eventual success of every call",
        "Only invalid input, because a corrected retry succeeds where the first call failed, while transient errors never recover",
        "None of them: retries are always wrong because repeating a request can only duplicate work and hide the real failure",
    ],
    ("07", 8): [
        "Sandboxes cannot store strings safely, so any credential kept inside gets truncated or corrupted at runtime and then causes confusing authentication errors",
        "Credentials slow the sandbox down, because every call must be signed inside it and signing adds noticeable latency",
        "MCP forbids credentials in any component, so a server storing a key anywhere would be rejected by compliant clients",
    ],
    ("07", 9): [
        "Nothing is needed: tools always trust the data they receive, so the model will ignore instructions inside product text",
        "A higher temperature, which makes the model less likely to repeat the exact instruction written in the catalog entry it is reading",
        "A longer system prompt only, listing every phrase that attackers might use, which removes the need for any other safeguards",
    ],
    ("08", 1): [
        "Nothing: nodes must print their results to the log, and LangGraph reads the printed output to update the graph",
        "A brand-new compiled graph for the next step, which replaces the existing graph and discards the old state",
        "The raw LLM response object, which LangGraph stores unchanged as the complete replacement for the shared state",
    ],
    ("08", 2): [
        "The router sends every request to QA, so the search node never runs and no product titles exist to mention",
        "FAISS returns too few chunks, so the policy context is empty and the model has nothing left to name",
        "The vision model is too small to recognise the boots, so it blocks every product name from the reply",
    ],
    ("08", 3): [
        "Large models cannot classify intents reliably because they tend to overthink short inputs, so classification must go to a small model, while only large models are able to write prose",
        "Small models write more natural customer-facing prose than large ones, and large models are better only at the rigid classification that routing needs, which saves cost overall in production",
        "LangGraph requires two distinct models in every graph, one assigned to the router node and a second assigned to the synthesis node, or compilation fails, so a second model is a framework requirement rather than a cost choice",
    ],
    ("08", 4): [
        "Python cannot search strings that contain a dollar sign, so the assertion raises an error whenever the model writes any currency symbol in its answer, and the test crashes before it can check the price",
        "Dollar signs are invalid inside test files, and the assertion also checks only the first character of the response, so it misses prices the agent states later in a long reply",
        "It only works for CrewAI crews, because LangGraph states cannot be searched with the in operator, so the check would never run against a graph-based system built the way ShopBot is",
    ],
    ("08", 5): [
        "Check the router's docstring and type hints with a linter, which confirms every branch is documented, and that proves failures are handled",
        "Increase max_tokens on the synthesis model, so that longer replies leave enough room to explain any agent that failed during the request",
        "Run the same query twice and compare the two replies, which shows whether the system returns the same wording each time, even after a failure",
    ],
    ("08", 6): [
        "CrewAI's sequential process, which runs tasks in a fixed linear order and has no cycles or approval steps",
        "A single large prompt that asks the model to retry, confirm, and order in one call, with no workflow",
        "No framework can do this, because retries and human approval require writing a custom scheduler from scratch",
    ],
    ("08", 7): [
        "When the task truly spans several distinct skills, because splitting it adds cost but never helps varied work",
        "When you need a different model for each step, since extra agents prevent you from selecting models per task",
        "When you need graceful degradation, because separate agents make partial failures harder to isolate than one",
    ],
    ("09", 1): [
        "The system is equally reliable on both sets, since 8% and 25% are both low enough to treat as noise",
        "The adversarial set is broken, because a rate three times higher than the generic set cannot be right",
        "GDR cannot compare two sets, because each set must be scored with its own separate judge, threshold, and rubric",
    ],
    ("09", 2): [
        "1.0, because most facts are right, and a binary label would capture that equally well",
        "0.2, the share of unsupported facts, and a binary label would hide that the other 80% were fine",
        "Undefined, because FActScore only works when it is combined with ROUGE overlap on the reference",
    ],
    ("09", 3): [
        "ROUGE ignores punctuation, so a response with the right words but broken sentences scores high while being unreadable",
        "ROUGE needs GPUs to run, so on CPU-only systems its scores are approximations that cannot be trusted as accuracy",
        "ROUGE measures only length, so a long response scores high regardless of whether its content matches the reference",
    ],
    ("09", 4): [
        "Using a longer judge prompt, since more instructions always remove the judge's bias toward its own style",
        "Raising the judge's temperature, so repeated runs average out and the single judge cannot favour one answer",
        "Trusting the judge's written explanation, because a clear justification shows that the score is right",
    ],
    ("09", 5): [
        "System-level batching through the chat endpoint, which returns every answer immediately at the normal full price",
        "Token streaming, which delivers each answer as it is generated, so the whole job finishes sooner overall",
        "Semantic caching, which reuses earlier answers for similar descriptions, so most items need no scoring",
    ],
    ("09", 6): [
        "Lower the similarity threshold so that more questions count as matches, which increases cache hits and fixes the mismatch",
        "Remove cache versioning, so old entries are never tied to a specific prompt or model release and are reused more widely across the system",
        "Cache order-status questions as well, because live answers also benefit from reuse, and then lower the threshold to match more",
    ],
    ("09", 7): [
        "It is too short to embed, because the embedding model needs a full sentence before it returns a vector",
        "Caches cannot store boolean answers, so a yes-or-no reply has to be recomputed every single time",
        "It is always a complex multi-step query, so the cache would return wrong results for every request",
    ],
    ("09", 8): [
        "Keep extending the keyword list forever, adding every phrase that has ever shown up in a complex request",
        "Always use the large model for every request, which removes routing mistakes entirely but gives up the savings",
        "Remove the length rule and send every short request to the small model, accepting that some will be wrong",
    ],
    ("09", 9): [
        "A final-answer LLM judge, which scores whether the confirmation message reads correctly and ignores the steps taken",
        "ROUGE against the reference answer, which matches the confirmation text and would show a perfect score",
        "Latency monitoring, which reveals the skipped step through a drop in response time for those requests",
    ],
    ("09", 10): [
        "Nothing is wrong: the first argument to aevaluate is the grader, and the agent under test is passed afterwards through the evaluators list",
        "aevaluate accepts only synchronous functions, so passing an async function raises an error, and the whole run should be switched to evaluate with threads",
        "Datasets cannot have outputs attached, so the data argument must contain only inputs and the reference answers are dropped silently at run time",
    ],
    ("09", 11): [
        "For strict, regulated workflows like refunds, where the required steps and their order are fixed by policy",
        "Always: comparing trajectories is never useful, so evaluation should look only at final answers and costs",
        "Only for single-step agents, because multi-step agents produce traces that cannot be compared with a reference",
    ],
    ("10", 3): [
        "They make the model more accurate, because the serving layer corrects token probabilities during generation",
        "They are required by the model license, which forbids calling generate() directly in a web process",
        "They remove the need for monitoring, because the server reports and fixes any quality problem itself",
    ],
    ("10", 4): [
        "Input tokens are free on most providers, so only output tokens need to appear in the estimate",
        "Output tokens are not billed at all, so the estimate should count input tokens and skip generation",
        "It only matters for self-hosted models, because hosted providers apply one blended price to every token",
    ],
    ("10", 5): [
        "Monitoring is working perfectly, since a low error rate and normal latency mean every response is correct",
        "A partial network outage affecting some regions, which raises complaints even though the error-rate metric stays low",
        "The users are mistaken, because satisfaction scores are subjective and carry no signal about the system's behavior",
    ],
    ("10", 6): [
        "Nothing to worry about: spend is down 25%, so the system is cheaper to run and no investigation is warranted",
        "A traffic spike that pushes cost per request up temporarily, which will settle once the load returns to its usual level",
        "A pricing error by the provider, which silently raised the per-token rate and should be disputed for a refund",
    ],
    ("10", 8): [
        "It uses less storage, since a week-old baseline can be compressed while the previous hour has to stay raw",
        "Providers bill weekly, so only a weekly comparison lines up with the invoice amounts you will be charged",
        "It is required by the API, which exposes metrics only as week-over-week windows and rejects hourly queries",
    ],
    ("11", 1): [
        "A random bug in the training code, which happens to affect Black patients more often than other groups",
        "The model was too small to learn needs well, so it defaulted to underestimating whichever group it saw least",
        "It must secretly be using race, because no other variable could produce a systematic group difference",
    ],
    ("11", 2): [
        "The bias is fixed because the groups are now balanced, so every group contributes equally to the training loss, and answer quality evens out",
        "Nothing changes, because oversampling copies existing examples and the model's behavior depends only on the amount of unique data",
        "The model refuses to answer that group's users, since the repeated transcripts trigger its duplicate-content safety filters during training",
    ],
    ("11", 3): [
        "It proves the model is unbiased, because identical outputs for swapped names rule out any other source of unfairness",
        "It works only on image models, because swapping a demographic signal needs pixel-level edits to the input",
        "It replaces all other evaluation, since a passing counterfactual test covers accuracy, safety, and fairness together",
    ],
    ("11", 4): [
        "Gender bias only, since the study measured one attribute and found that race had no measurable effect at all",
        "That embedding models are unbiased, because the r\u00e9sum\u00e9 rankings matched human recruiters' choices for every name tested",
        "That the sample was too small to mean anything, so the pattern should be ignored until a larger study repeats it",
    ],
    ("11", 5): [
        "It enforces demographic parity, pushing the average predicted probability for each group toward the same value",
        "It enforces calibration, so predicted probabilities match observed outcomes within every group and score bucket",
        "It doubles the learning rate for the group with the larger mean, so that its gradients dominate each update",
    ],
    ("11", 6): [
        "It must also have equal false-positive and false-negative rates, since calibration implies parity of every error type",
        "It is perfectly fair, because calibration for both groups already satisfies every other fairness definition at once",
        "Base rates do not matter, because calibrated scores always lead to equal error rates, whatever the groups' prevalence",
    ],
    ("11", 7): [
        "A human reviews every gradient update during training, rejecting any change that would make the model less safe",
        "A runtime keyword filter that scans each draft reply and blocks any output containing a banned phrase",
        "Fine-tuning only on a fixed list of banned words, so the model learns never to generate any of them",
    ],
    ("11", 8): [
        "Nothing: no names are present in the sentence, so the pattern finds no match and the text passes through unchanged",
        "Only the word \"Patient\" is removed, since the pattern needs a leading capital letter that only that word has, so the rest of the sentence is kept",
        "It raises an error, because combining IGNORECASE with a character class that lists capitals is not allowed in Python",
    ],
    ("11", 9): [
        "It encrypts the card number in place, so that any stored copy is unreadable if the log is leaked",
        "It is required by GDPR, which mandates the checksum test for any text that resembles a payment card",
        "It detects expired cards, because the final check digit encodes the expiry date of the card",
    ],
    ("11", 10): [
        "Fine-tune the model on all user data and retrain annually, so any erasure request waits for the next cycle",
        "Ignore requests concerning data already absorbed into model weights, since it cannot be located or removed",
        "Pseudonymize names in the training data and then treat the whole dataset as no longer personal data",
    ],
    ("11", 12): [
        "Append a disclaimer saying to consult a doctor, and then send the draft to the user as written",
        "Send it unchanged, since the user asked for the information and the system should not second-guess them",
        "Shorten the answer so that the dangerous phrase is trimmed, then send what remains without logging",
    ],
    ("11", 13): [
        "Nothing else; only the model call itself needs redacted text, and the rest may keep the original",
        "Only the model's response, since the logs and monitors do not store the user's text in any form",
        "Only error messages, because normal traces are anonymized automatically before they are stored",
    ],
}


def esc(t: str) -> str:
    return t.replace("\\", "\\\\").replace("'", "\\'")


def raw_tokens(block: str) -> list[str]:
    out = []
    i = block.index("[") + 1
    while True:
        while i < len(block) and block[i] in " \t\r\n,":
            i += 1
        if block[i] == "]":
            return out
        j = i + 1
        while block[j] != "'":
            j += 2 if block[j] == "\\" else 1
        out.append(block[i : j + 1])
        i = j + 1


def main() -> int:
    files = {p.name[:2]: p for p in sorted(DIR.glob("*.mdx"))}
    by_file: dict[str, dict[int, list[str]]] = {}
    for (f, qn), w in W.items():
        by_file.setdefault(f, {})[qn] = w
    order = 0
    plan = sorted(W.keys())
    seq = {k: POS[i % 8] for i, k in enumerate(plan)}
    total = 0
    for f, qs in by_file.items():
        path = files[f]
        with open(path, encoding="utf-8", newline="") as fh:
            text = fh.read()
        pos = 0
        qn = 0
        while True:
            found = s.find_choices(text, pos)
            if not found:
                break
            c_start, c_end, choices = found
            ans = s.find_answer(text, c_end)
            if not ans or len(choices) < 2 or ans[1] >= len(choices):
                pos = c_end
                continue
            qn += 1
            if qn not in qs:
                pos = ans[0]
                continue
            old_ans = ans[1]
            block = text[c_start:c_end]
            raws = raw_tokens(block)
            assert len(raws) == 4, (f, qn)
            correct_raw = raws[old_ans]
            new_pos = seq[(f, qn)]
            wr = [f"'{esc(x)}'" for x in qs[qn]]
            new = []
            wi = 0
            for k in range(4):
                if k == new_pos:
                    new.append(correct_raw)
                else:
                    new.append(wr[wi])
                    wi += 1
            m = re.search(r"choices:\s*\[(\s*)'", block)
            ind = m.group(1)
            close_m = re.search(r"(\s*)\]$", block)
            close_ind = close_m.group(1)
            new_block = "choices: [" + ",".join(ind + t for t in new) + "," + close_ind + "]"
            # answer digits
            tail = text[c_end : ans[0]]
            new_tail = re.sub(r"(answer:\s*)\d+", lambda mm: mm.group(1) + str(new_pos), tail)
            text = text[:c_start] + new_block + new_tail + text[ans[0] :]
            pos = c_start + len(new_block) + len(new_tail)
            total += 1
        path.write_text(text, encoding="utf-8", newline="")
        print(path.name, "ok")
    print("updated", total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
