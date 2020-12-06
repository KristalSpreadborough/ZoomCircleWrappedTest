export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Circle Packing - Text Wrap Example 2

Adapted text wrap technique from: https://observablehq.com/@mbostock/fit-text-to-circle

The area of each leaf circle in a circle-packing diagram is proportional its value (here, file size). Although nested circles do not use space as efficiently as a [treemap](/@d3/treemap), the “wasted” space better reveals the hierarchical structure.`
)});
  main.variable(observer("chart")).define("chart", ["pack","d3","DOM","textRadius","lines","words","format"], function(pack,d3,DOM,textRadius,lines,words,format)
{

  const PROC = "#F9B6B6"; //red
  const DISO = "#F9DCB6"; //orange
  const FIND = "#B6DAF9"; //blue
  const ANAT = "#B6F9CD"; //green
  const ACTI = "#E5E826"; //yellow-green
  const DRUG = "#DFB6F9"; //purple
  const CHEM_DRUG = "#DFB6F9"; //purple

  const derm = "#FFF9EC"; // light orange
  const cardio = "#FFE6DF"; // light red
  const gih = "#EBFFF1"; // light green

  const title = "GIH — U";

  var data={
 "name": "flare", "mycolor": gih, "stroke": "#727272",
     "children": [
       {
        "name": "Groups",
        "children": [
         {"name": "Melbourne Data Analytics Platform (MDAP): A team of Research Data Specialists and Research Data Stewards working to enable data-intensive research across the disciplines, as part of the University’s Petascale Campus Initiative.", "value": 1082},
         {"name": "Social and Cultural Informatics Platform: Embedded within the Humanities, Arts and Social Science faculties; provides specialist support with digital research methods and project delivery.", "value": 1336}
        ]
       },
       {
        "name": "Platforms",
        "children": [
         {"name": "Figshare: A repository that can be used for publishing and sharing creative and research outputs (except for journal articles/theses). The University has an institutional figshare that all staff can use: https://melbourne.figshare.com/", "value": 1082},
         {"name": "Omeka: An online gallery platform for showcasing and displaying research outputs. https://gateway.research.unimelb.edu.au/resources/platforms-infrastructure-and-equipment/research-computing-services/services/data-storage-management/omeka", "value": 1336}
        ]
       },
       {
        "name": "Research Areas",
        "children": [
         {"name": "Ecology of Resources: A set of resources (e.g. tools such as Zoom) that you use to interact and communicate with others, including students and colleagues. For more information see: https://doi.org/10.4324/9780203075227.ch3 ", "value": 1082},
         {"name": "Scholarship of teaching and learning: A systematic approach that uses investigations into student learning to inform educational practice.", "value": 1336},
         {"name": "Scholarship of technology enhanced learning: SOTL that is specifically applied to TEL practices", "value": 319},
         {"name": "Technology enhanced learning: When technologies of any kind are used to enhance the learning experience in any way ", "value": 10498},
         {"name": "Post-digital: Post-digital theory examines how our relationship with digital technologies has changes, and is changing. It emphasised human experience over digital design. Read more here: https://en.wikipedia.org/wiki/Postdigital", "value": 2822}
        ]
       },
       {
        "name": "Places",
        "children": [
         {"name": "Galleries, Libraries, Archives, and Museums (GLAM): Refers to cultural institutions with a mission to provide access to knowledge. For more information see https://en.wikipedia.org/wiki/GLAM_(industry_sector)", "value": 1082}
        ]
       }
     ]
       }


  const root = pack(data);

  const svg = d3.select(DOM.svg(1000, 1000))
      //.style("font", "13px avenir")
      .style("width", "100%")
      .style("height", "auto")
      .attr("text-anchor", "middle");

      //just added this
  const svg = d3.create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("background", color(0))
      .style("cursor", "pointer")
      .on("click", (event) => zoom(event, root));


  svg.append("text")
      .attr("x", 100)
      .attr("y", 30)    // +20 to adjust position (lower)
      .text(title)
      .attr("font-size", "24px")
      .attr("fill",  "#000000")
      .attr("font-weight",function(d,i) {return i*100+700;})


  const shadow = DOM.uid("shadow");

  svg.append("filter")
      .attr("id", shadow.id)
      .append("feDropShadow")
      .attr("flood-opacity", 0.4)
      .attr("dx", 1)
      .attr("dy", 1);

  // var node = svg.selectAll("g")
    // .data(d3.nest().key(d => d.height).entries(root.descendants()))
    // .join("g")
    // .attr("filter", shadow)
    // .selectAll("g")
    // .data(d => d.values)
    // .join("g")
    // .attr("transform", d => `translate(${d.x + 2.5},${d.y + 2.5})`)


    const node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : "white")
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));


 var circle = node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.data.mycolor)
      .style("stroke", d => d.data.stroke)
      .attr("stroke-width", 4)

  const leaf = node.filter(d => !d.children);

  leaf.select("circle")
      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id);

  leaf.append("clipPath")
      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
      .append("use")
      .attr("xlink:href", d => d.leafUid.href);

  const leafText = leaf.append("text")
      .attr("transform", (d, i, nodes) =>
                              `translate(${ +d3.select(nodes[i].parentNode).select("circle").attr("cx")},
                                         ${ +d3.select(nodes[i].parentNode).select("circle").attr("cx")})
                                scale(${ +d3.select(nodes[i].parentNode).select("circle").attr("r") * 0.6
                                         / textRadius(lines(words(d.data.name))) })`
           )
      .selectAll("tspan")
      .data(d => lines(words(d.data.name)) )
      .join("tspan")
      //.attr("clip-path", d => d.clipUid)
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d.text );

  node.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  return svg.node();


}
);
  main.variable(observer("words")).define("words", function(){return(
function(text) {
  const words = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  if (!words[words.length - 1]) words.pop();
  if (!words[0]) words.shift();
  return words;
}
)});
  main.variable(observer("measureWidth")).define("measureWidth", function()
{
  const context = document.createElement("canvas").getContext("2d");
  return text => context.measureText(text).width;
}
);
  main.variable(observer("lineHeight")).define("lineHeight", function(){return(
18
)});
  main.variable(observer("targetWidth")).define("targetWidth", ["measureWidth","lineHeight"], function(measureWidth,lineHeight){return(
text => Math.sqrt(measureWidth(text.trim()) * lineHeight)
)});
  main.variable(observer("lines")).define("lines", ["measureWidth","targetWidth"], function(measureWidth,targetWidth){return(
function(words) {
  let line;
  let lineWidth0 = Infinity;
  const lines = [];
  for (let i = 0, n = words.length; i < n; ++i) {
    let lineText1 = (line ? line.text + " " : "") + words[i];
    let lineWidth1 = measureWidth(lineText1);
    if ((lineWidth0 + lineWidth1) / 2 < targetWidth(words.join(" ")) ) {
      line.width = lineWidth0 = lineWidth1;
      line.text = lineText1;
    } else {
      lineWidth0 = measureWidth(words[i]);
      line = {width: lineWidth0, text: words[i]};
      lines.push(line);
    }
  }
  return lines;
}
)});
  main.variable(observer("textRadius")).define("textRadius", ["lineHeight"], function(lineHeight){return(
function(lines) {
  let radius = 0;
  for (let i = 0, n = lines.length; i < n; ++i) {
    const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
    const dx = lines[i].width / 2;
    radius = Math.max(radius, Math.sqrt(dx ** 2 + dy ** 2));
  }
  return radius;
}
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
data => d3.pack()
    .size([width - 2, height - 2])
    .padding(3)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
)});
  main.variable(observer("width")).define("width", function(){return(
975
)});
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(",d")
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleSequential([5, -2], d3.interpolateMagma)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
