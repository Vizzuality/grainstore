var assert     = require('assert');
var _          = require('underscore');
var StyleTrans = require('../lib/grainstore/style_trans.js');

var t = new StyleTrans();

suite('style_trans', function() {

  //suiteSetup(function() { });

  // No change from 2.0.0 to ~2.0.2 
  test('2.0.0 to ~2.0.2', function() {
    var style = "#tab[zoom=1] { marker-width:10; marker-height:20; }\n#tab[zoom=2] { marker-height:'6'; marker-width: '7'; }";
    var s = t.transform(style, '2.0.0', '2.0.2');
    assert.equal(s, style);
    var s = t.transform(style, '2.0.0', '2.0.3');
    assert.equal(s, style);
  });

  // No change from 2.0.2 to ~2.0.3
  test('2.0.2 to ~2.0.3', function() {
    var style = "#tab[zoom=1] { marker-width:10; marker-height:20; }\n#tab[zoom=2] { marker-height:'6'; marker-width: '7'; }";
    var s = t.transform(style, '2.0.2', '2.0.3');
    assert.equal(s, style);
  });

  // Adapts marker width and height, from 2.0.2 to 2.1.0
  test('2.0.2 to 2.1.0, markers', function() {
    var s = t.transform(
"#tab[zoom=1] { marker-width:10; marker-height:20; }\n#tab[zoom=2] { marker-height:'6'; marker-width: '7'; }"
    , '2.0.2', '2.1.0'
    );
    var e = "#tab[zoom=1] { marker-width:20; marker-height:40; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }\n#tab[zoom=2] { marker-height:'12'; marker-width:'14'; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
    assert.equal(s,e);

    var s = t.transform(
"#t { marker-width :\n10; \nmarker-height\t:   20; }"
    , '2.0.2', '2.1.0'
    );
    var e = "#t { marker-width:20; \nmarker-height:40; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
    assert.equal(s,e);

  });

  // More markers, see https://github.com/Vizzuality/grainstore/issues/30
  test('2.0.0 to 2.1.0, more markers', function() {
    var s = t.transform(
      "#t [a<1] { marker-width:1 } # [a>1] { marker-width:2 }"
    , '2.0.2', '2.1.0'
    );
    var e = "#t [a<1] { marker-width:2; "
          + "[mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } "
          + "[mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
          + " # [a>1] { marker-width:4; "
          + "[mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } "
          + "[mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }";
//console.log("O:"+s);
//console.log("E:"+e);
    assert.equal(s, e);
  });

  // More markers, see https://github.com/Vizzuality/grainstore/issues/33
  test('2.0.0 to 2.1.0, markers dependent on filter', function() {
    var s = t.transform(
      "#t[a=1] { marker-width:1 } #t[a=2] { line-color:red } #t[a=3] { marker-placement:line }"
    , '2.0.2', '2.1.0'
    );
    var e = "#t[a=1] { marker-width:2; "
          + "[mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } "
          + "[mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } } "
          + "#t[a=2] { line-color:red; line-clip:false; } "
          + "#t[a=3] { marker-placement:line; "
          // NOTE: we do override marker-placement for points because "line" doesn't work in 2.1.0
          //       and it worked exactly as "point" in 2.0.0
          + "[mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } "
          // NOTE: we do NOT override marker-placement for lines or polys
          + "[mapnik-geometry-type>1] { marker-type:arrow; marker-clip:false; } }"
        ;
//console.log("O:"+s);
//console.log("E:"+e);
    assert.equal(s, e);
  });

  // Adapts marker width and height, from 2.0.0 to 2.1.0
  test('2.0.0 to 2.1.0, markers', function() {
    var s = t.transform(
"#tab[zoom=1] { marker-width:10; marker-height:20; }\n#tab[zoom=2] { marker-height:'6'; marker-width: \"7\"; }"
    , '2.0.0', '2.1.0'
    );
    var e = "#tab[zoom=1] { marker-width:20; marker-height:40; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }\n#tab[zoom=2] { marker-height:'12'; marker-width:\"14\"; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
//console.log("O:"+s);
//console.log("E:"+e);
    assert.equal(s, e, "Obt:"+s+"\nExp:"+s);

    var s = t.transform(
"#t { marker-width :\n10; \nmarker-height\t:   20; }"
    , '2.0.0', '2.1.0'
    );
    var e = "#t { marker-width:20; \nmarker-height:40; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
    assert.equal(s, e);

    var s = t.transform(
"#tab { marker-width:2 }"
    , '2.0.0', '2.1.0'
    );
    var e = "#tab { marker-width:4; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }"
    assert.equal(s, e);

    var s = t.transform(
"#tab{ marker-width:2 }"
    , '2.0.0', '2.1.0'
    );
    var e = "#tab{ marker-width:4; [mapnik-geometry-type=1] { marker-placement:point; marker-type:ellipse; } [mapnik-geometry-type>1] { marker-placement:line; marker-type:arrow; marker-clip:false; } }";
    assert.equal(s, e);

    // line clipping
    var s = t.transform(
"#tab{ line-opacity:.5 }"
    , '2.0.0', '2.1.0'
    );
    var e = "#tab{ line-opacity:.5; line-clip:false; }";
    assert.equal(s, e);

  });

  // Nothing to adapt (yet) when no markers are involved
  test('2.0.0 to 2.1.0, no markers', function() {
    var s = t.transform(
"#tab[zoom=1] { line-fill:red; }\n#tab[zoom=2] { polygon-fill:blue; }"
    , '2.0.0', '2.1.0'
    );
    assert.equal(s,
"#tab[zoom=1] { line-fill:red; line-clip:false; }\n#tab[zoom=2] { polygon-fill:blue; polygon-clip:false; }"
    );

  });

  //suiteTeardown(function() { });

});