import type { FreshJourneyCase } from "../journey-fresh";

export const sqlFoundationFreshCases: Record<string, FreshJourneyCase> = {
 "sql-tables": {
  name:"Two identical descriptions still have different identities",prompt:"The new register contains P9 and P8, both fans at west. Predict the asset-ID and kind report without collapsing the two real assets.",
  data:{rows:[{asset_id:"P9",site:"west",kind:"fan"},{asset_id:"P8",site:"west",kind:"fan"}]},expected:[{asset_id:"P8",kind:"fan"},{asset_id:"P9",kind:"fan"}],
  why:"The requested grain remains one registered asset. Equal descriptions do not remove distinct IDs.",
 },
 "sql-select": {
  name:"Several assets form one pair while a new kind adds another",prompt:"West has two fans and one pump. Predict the unique site-kind pairs, in the requested order.",
  data:{rows:[{asset_id:"P9",site:"west",kind:"pump"},{asset_id:"P8",site:"west",kind:"fan"},{asset_id:"P7",site:"west",kind:"fan"}]},expected:[{site:"west",kind:"fan"},{site:"west",kind:"pump"}],
  why:"Projection makes the two fan records identical as result pairs, while pump remains a distinct category.",
 },
 "sql-where": {
  name:"A missing duration does not pass a numerical condition",prompt:"All three visits found loose components. Their minutes are null, 10 and 11. Predict the report while keeping only durations established to be at least ten.",
  data:{rows:[{inspection_id:8,finding:"loose",minutes:null},{inspection_id:9,finding:"loose",minutes:10},{inspection_id:7,finding:"loose",minutes:11}]},expected:[{inspection_id:7,minutes:11},{inspection_id:9,minutes:10}],
  why:"The missing measurement does not establish the comparison. Both known values meet the inclusive threshold.",
 },
 "sql-order-limit": {
  name:"Only one duration is known",prompt:"The shift has one recorded zero-minute visit and one missing duration. Predict a shortlist capped at two without manufacturing a second known result.",
  data:{rows:[{inspection_id:8,minutes:null},{inspection_id:9,minutes:0}]},expected:[{inspection_id:9,minutes:0}],
  why:"A maximum of two is not a requirement to return two rows. The zero is known and eligible; the missing duration is excluded.",
 },
 "sql-null": {
  name:"Every duration has now been entered",prompt:"The two visits record zero and seven minutes. Predict the missing-duration follow-up report.",
  data:{rows:[{inspection_id:8,asset_id:"P8",minutes:0},{inspection_id:9,asset_id:"P9",minutes:7}]},expected:[],
  why:"Neither field contains null. A report of missing durations should become empty once all values are known.",
 },
 "sql-case": {
  name:"Known readings fall on opposite sides",prompt:"The new readings are 74, 76 and zero. Predict their labels in reading-ID order under the same threshold policy.",
  data:{rows:[{reading_id:9,temperature:74},{reading_id:7,temperature:76},{reading_id:8,temperature:0}]},expected:[{reading_id:7,action:"inspect"},{reading_id:8,action:"monitor"},{reading_id:9,action:"monitor"}],
  why:"All values are known. Zero follows the below-threshold branch instead of the missingness branch.",
 },
 "sql-aggregates": {
  name:"A known zero differs from an entirely unknown total",prompt:"One loose visit records zero minutes and another loose visit is missing its duration. A clear visit records 90. Predict the total of known loose-visit minutes.",
  data:{rows:[{inspection_id:1,finding:"loose",minutes:0},{inspection_id:2,finding:"loose",minutes:null},{inspection_id:3,finding:"clear",minutes:90}]},expected:[{total_minutes:0}],
  why:"The qualifying population contains a known numeric zero, so its sum is zero. The unrelated clear visit cannot contribute.",
 },
 "sql-group-by": {
  name:"A group can exist while all its durations are unknown",prompt:"P8 has two inspection records with null durations. P9 has one known five-minute visit. Predict the grouped duration report.",
  data:{rows:[{asset_id:"P9",minutes:5},{asset_id:"P8",minutes:null},{asset_id:"P8",minutes:null}]},expected:[{asset_id:"P8",total_minutes:null},{asset_id:"P9",total_minutes:5}],
  why:"P8 has source records and therefore a group, but that group has no known duration to sum.",
 },
 "sql-having": {
  name:"Two assets meet the inclusive recurrence threshold",prompt:"P8 has two loose visits and P9 has three. Predict the report, including both groups and their exact counts.",
  data:{rows:[{asset_id:"P9",finding:"loose"},{asset_id:"P8",finding:"loose"},{asset_id:"P9",finding:"loose"},{asset_id:"P8",finding:"loose"},{asset_id:"P9",finding:"loose"}]},expected:[{asset_id:"P8",loose_visits:2},{asset_id:"P9",loose_visits:3}],
  why:"The group filter is at least two, so the exact-boundary group remains as well as the larger group.",
 },
 "sql-inner-joins": {
  name:"Two visits reuse the same active register record",prompt:"P8 has two visits and one active register row at west. Predict the attached site for both visits without collapsing them into one asset row.",
  data:{visits:[{inspection_id:9,asset_id:"P8",minutes:4},{inspection_id:8,asset_id:"P8",minutes:6}],assets:[{asset_id:"P8",site:"west",active:1}]},expected:[{inspection_id:8,asset_site:"west",minutes:6},{inspection_id:9,asset_site:"west",minutes:4}],
  why:"Each visit produces its own matching pair with the unique asset record. Sharing a partner does not merge the visits.",
 },
 "sql-left-joins": {
  name:"A real qualifying visit has no recorded minutes",prompt:"P8 has a loose visit with a real inspection ID and missing minutes; P9 has no visits. Predict the loose-visit counts.",
  data:{assets:[{asset_id:"P8"},{asset_id:"P9"}],visits:[{inspection_id:8,asset_id:"P8",finding:"loose",minutes:null}]},expected:[{asset_id:"P8",loose_visits:1},{asset_id:"P9",loose_visits:0}],
  why:"Count the matched visit identity, not its nullable duration. The real visit and unmatched placeholder are different cases.",
 },
 "sql-join-grain": {
  name:"One asset is present in only one stream",prompt:"P8 has two visits and one reading; P9 has one visit but no reading. Predict this workshop’s inner-joined summaries. The later SQL challenge uses the register to retain every asset.",
  data:{visits:[{asset_id:"P8",inspection_id:1},{asset_id:"P9",inspection_id:2},{asset_id:"P8",inspection_id:3}],readings:[{asset_id:"P8",reading_id:1}]},expected:[{asset_id:"P8",visits:2,readings:1}],
  why:"Separate counting prevents multiplication, while the explicitly chosen inner join retains only keys present in both summaries. Retention is independent of grain correctness.",
 },
};
