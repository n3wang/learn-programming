/**
 * DDIA lesson flags — one flag per chapter page.
 *
 * `parts[].from` is the challenge id (MultipleChoice `id` / CodeExercise `heading`);
 * `parts[].seg` is the word revealed when that challenge is finished. It must match the
 * `flagSegment` prop on the MDX challenge (the catalog is what submissions are checked against).
 */
const BASE = '/fundamentals/scalable-systems/designing-data-intensive-applications';

export default [
  {
    id: 'ddia-ch01-graphs',
    title: 'Graph-Like Data Models',
    series: 'ddia',
    paths: [`${BASE}/graph-like-data-models`],
    parts: [
      {from: 'ge-ddia-property-graphs', seg: 'PROPGRAPH'},
      {from: 'ge-ddia-cypher', seg: 'CYPHER'},
      {from: 'ge-ddia-sparql', seg: 'TRIPLE'},
      {from: 'ge-ddia-datalog', seg: 'DATALOG'},
    ],
  },
  {
    id: 'ddia-ch02-hash-lsm',
    title: 'Hash Indexes and LSM-Trees',
    series: 'ddia',
    paths: [`${BASE}/hash-indexes-and-lsm-trees`],
    parts: [
      {from: 'exercise-toy-db', seg: 'APPEND'},
      {from: 'ddia-storage-toy-db', seg: 'INDEXCOST'},
      {from: 'ddia-storage-hash-index', seg: 'BITCASK'},
      {from: 'exercise-compaction', seg: 'COMPACT'},
      {from: 'ddia-storage-lsm', seg: 'SSTABLE'},
    ],
  },
  {
    id: 'ddia-ch03-btrees',
    title: 'B-Trees and Other Indexing Structures',
    series: 'ddia',
    paths: [`${BASE}/b-trees-and-other-indexing-structures`],
    parts: [
      {from: 'ddia-storage-btree-structure', seg: 'BTREE'},
      {from: 'ddia-storage-comparison', seg: 'WRITEAMP'},
      {from: 'ddia-storage-other-indexes', seg: 'SECONDARY'},
    ],
  },
  {
    id: 'ddia-ch04-encoding',
    title: 'Formats for Encoding Data',
    series: 'ddia',
    paths: [`${BASE}/formats-for-encoding-data`],
    parts: [
      {from: 'ddia-encoding-fundamentals', seg: 'BACK'},
      {from: 'ddia-encoding-textual-formats', seg: 'COMPAT'},
      {from: 'exercise-length-prefixed', seg: 'LENPFX'},
      {from: 'ddia-encoding-thrift-protobuf', seg: 'TAGS'},
      {from: 'ddia-encoding-avro', seg: 'BYNAME'},
      {from: 'exercise-schema-resolution', seg: 'AVRO'},
    ],
  },
  {
    id: 'ddia-ch05-dataflow',
    title: 'Modes of Dataflow',
    series: 'ddia',
    paths: [`${BASE}/modes-of-dataflow`],
    parts: [
      {from: 'ddia-dataflow-databases', seg: 'OUTLIVES'},
      {from: 'exercise-idempotent-retry', seg: 'IDEMPOTENT'},
      {from: 'ddia-dataflow-rpc', seg: 'REST'},
      {from: 'exercise-pubsub', seg: 'PUBSUB'},
      {from: 'ddia-dataflow-messaging', seg: 'BROKER'},
    ],
  },
];
