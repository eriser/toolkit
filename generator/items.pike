#! /usr/bin/env pike

import Stdio;

constant OUT_VARIABLE    = "items";
constant OUT_FILE        = "./javascript/items.js";
constant CATEGORY_DIR    = "./toolkit";
constant CSS_DIR         = "./toolkit/templates/default/css";
constant IMAGE_DIR       = "./toolkit/templates/default/images";
constant CATEGORY_MARKER = "@category: ";
constant KEYWORDS        = ({ "class", "element", "event", "module", "method" });
constant CLASS_KEYWORDS  = ({ "implements", "extends", "option", "description" });
constant METHOD_KEYWORDS = ({ "option", "description" });
constant ELEMENT_ATOMS   = ({ "name", "class", "description" });
constant MODULE_ATOMS    = ({ "name", "description" });
constant OPTION_ATOMS    = ({ "name", "type", "default", "description" });
constant EVENT_ATOMS     = ({ "name", "arguments", "description" });

mapping(string:mixed) _recipient;

array(string) trim_array (array(string) a) {
    for (int i = 0; i < sizeof(a); i++)
        a[i] = String.trim_all_whites(a[i]);
    return a - ({ "" });
}

mapping(string:string) get_atoms_mapping (string c, array(string) keys) {
    mapping(string:string) m = ([]);
    array(string) a = trim_array(c / ";");
    for (int i = 0; i < sizeof(keys); i++)
        m[keys[i]] = a[i];
    return m;
}

void process_element (string type, string content, mapping map) {
    //write("type: " + type + "\n" + content + "\n\n");
    string c = String.trim_all_whites(content);
    switch (type) {
        case "class":
            map->name = c;
            _recipient = map;
            break;
        case "element":
            map->elements += ({ get_atoms_mapping(c, ELEMENT_ATOMS) });
            break;
        case "event":
            map->events += ({ get_atoms_mapping(c, EVENT_ATOMS) });
            break;
        case "module":
            map->modules += ({ get_atoms_mapping(c, MODULE_ATOMS) });
            break;
        case "method":
            map->methods += ({ ([ "name" : c ]) });
            _recipient = map->methods[-1];
            break;
        case "implements":
            map->implements += trim_array(c / ",");
            break;
        case "extends":
            map->extends += trim_array(c / ",");
            break;
        case "option":
            _recipient->options += ({ get_atoms_mapping(c, OPTION_ATOMS) });
            break;
        case "description":
            _recipient->description = c;
            break;
    }
}

mapping(string:mixed) parse_code(string code) {
    mapping(string:mixed) map = ([]);
    array(string) elements = ({});
    int i  = 0;
    int to = 0;
    while ((i = search(code, "/*", i)) > -1) { // loop over comment openers "/*"
        if ((to = search(code, "*/", i) - 1) < i) continue; // no closing comment tag was found
        string c = code[(i + 2)..(i = to)]; // extract the comment
        c = Regexp.PCRE("\n[ \t]*[\*][ \t]*")->replace(c, " "); // remove possible * and spaces on newlines
        c = Regexp.PCRE("^[ \t]*")->replace(c, ""); // replace leading spaces
        c = Regexp.PCRE("[ \t]+")->replace(c, " "); // replace multiple spaces
        to = search(c, ":");
        if (c[0..0] != "@" || to < 0 || search(KEYWORDS, c[1..(to-1)]) < 0)
            continue; // no usable entry (no @, no :, no keyword)
        foreach (c / "@", string a) {
            if (a == "") continue; // skip empty strings
            if (search(KEYWORDS + CLASS_KEYWORDS + METHOD_KEYWORDS, (c[1..] / ":")[0]) < 0)
                elements[sizeof(elements) - 1] += "@" + a; // this is no element, so add to last entry in elements array
            else
                elements += ({ a }); // appears to be an element, so append to elements array
        }
    }
    string t;
    foreach (elements, string e)
        process_element((t = (e / ":")[0]), e[sizeof(t) + 2..], map);
    return map;
}

array(mapping) process_category (string dir) {
    array(mapping) list = ({});
    foreach (get_dir(dir), string file) {
        if (!has_suffix(file, ".js")) continue;
        mapping(string:mixed) m = parse_code(read_bytes(combine_path(dir, file)));
        if (!equal(m, ([]))) {
            string f;
            m->files = ({ combine_path(dir, file) });
            f = combine_path(CSS_DIR, file[..sizeof(file)-4] + ".css");
            write(f+"\n");
            if (exist(f))
                m->files += ({ f });
            f = combine_path(IMAGE_DIR, file[..sizeof(file)-4]);
            if (exist(f))
                m->files += get_dir(f);
            list += ({ m });
        }
    }
    return list;
}

array(mapping) traverse_categories (string cats) {
    array(mapping) categories = ({});
    foreach (get_dir(cats), string dir) {
        dir = combine_path(cats, dir);
        if (!is_dir(dir)) continue;
        string fname = combine_path(dir, "README");
        if (exist(fname)
        && Stdio.read_bytes(fname, 0, sizeof(CATEGORY_MARKER)) == CATEGORY_MARKER) {
            mapping(string:mixed) map = ([]);
            map->name = String.trim_all_whites(Stdio.read_file(fname, 0, 1)[sizeof(CATEGORY_MARKER)..]);
            map->description = String.trim_all_whites(Stdio.read_file(fname, 1));
            map->items = process_category(dir);
            categories += ({ map });
        }
    }
    return categories;
}

int main () {
    array(mapping) cats = traverse_categories(CATEGORY_DIR);
    Stdio.write_file(OUT_FILE, OUT_VARIABLE + "=" + string_to_utf8(Standards.JSON.encode(cats)));
    return 0;
}