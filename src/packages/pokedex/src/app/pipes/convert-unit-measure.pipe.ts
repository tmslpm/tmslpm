import { Pipe, PipeTransform } from "@angular/core";

/**
 * ## 1) In the component
 * 
 * ```ts
 * ＠Component({ 
 *  selector: "app-home",
 *  standalone: true,
 *  imports: [CommonModule, ConvertUnitMeasure]
 * })
 * export class YourComponent { }
 * ```
 * 
 * ## 2) In the template html
 * ```html
 *   <div>{{ 50 | convertUnitMeasure:'kg':'g' }}</div>
 *   <div>{{ 50 | convertUnitMeasure:'m':'hm' }}</div>
 *   <div>{{ 50 | convertUnitMeasure:'cm':'m' }}</div>
 *   <div>{{ 50 | convertUnitMeasure:'g':'kg' }}</div>
 * ```
 */
@Pipe({ name: 'convertUnitMeasure', standalone: true })
export class ConvertUnitMeasure implements PipeTransform {
  private static readonly UNITS = {
    /* height */
    mm: 1,
    cm: 10,
    dm: 100,
    m: 1000,
    dam: 10000,
    hm: 100000,
    km: 1000000,
    /* weight */
    mg: 1,
    cg: 10,
    dg: 100,
    g: 1000,
    dag: 10000,
    hg: 100000,
    kg: 1000000,
  }

  public transform(value: number, from: keyof typeof ConvertUnitMeasure.UNITS, to: keyof typeof ConvertUnitMeasure.UNITS): string {
    const tryGetFrom = ConvertUnitMeasure.UNITS[from];
    if (!tryGetFrom) {
      throw new Error("Invalid paramater for 'from'")
    }
    const tryGetTo = ConvertUnitMeasure.UNITS[to];

    if (!tryGetTo) {
      throw new Error("Invalid paramater for 'to'")
    }
    return `${(value * tryGetFrom) / tryGetTo} ${to}`;
  }

}
