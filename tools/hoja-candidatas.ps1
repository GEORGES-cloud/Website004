# Descarga miniaturas de fotos de Unsplash y monta una hoja de contacto numerada para elegir.
# OJO: PowerShell no distingue mayúsculas en las variables ($w es $W): no reutilizar esos nombres.
#   tools\hoja-candidatas.ps1 -Slugs photo-123-abc,photo-456-def -Salida photos\sheets\nuevas.jpg
param([string[]]$Slugs, [string]$Salida = "photos\sheets\candidatas.jpg", [int]$Columnas = 4)
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$tmp = Join-Path $env:TEMP "luxor-miniaturas"
New-Item -ItemType Directory -Force $tmp | Out-Null
$W = 420; $H = 300; $cab = 26
$filas = [math]::Ceiling($Slugs.Count / $Columnas)
$hoja = New-Object System.Drawing.Bitmap(($W * $Columnas), (($H + $cab) * $filas))
$g = [System.Drawing.Graphics]::FromImage($hoja)
$g.Clear([System.Drawing.Color]::White); $g.InterpolationMode = 'HighQualityBicubic'
$f = New-Object System.Drawing.Font('Consolas', 13, [System.Drawing.FontStyle]::Bold)
for ($i = 0; $i -lt $Slugs.Count; $i++) {
  $s = $Slugs[$i]; $dst = Join-Path $tmp "$s.jpg"
  if (-not (Test-Path $dst)) { curl.exe -sS -L --max-time 40 -o $dst "https://images.unsplash.com/$s`?w=600&q=70&fm=jpg&fit=max" }
  $x = ($i % $Columnas) * $W; $y = [math]::Floor($i / $Columnas) * ($H + $cab)
  $g.DrawString("[$i] $($s.Substring(6, [math]::Min(22, $s.Length - 6)))", $f, [System.Drawing.Brushes]::Black, $x + 4, $y + 4)
  try {
    $img = [System.Drawing.Image]::FromFile($dst)
    $k = [math]::Min($W / $img.Width, $H / $img.Height); $aw = [int]($img.Width * $k); $ah = [int]($img.Height * $k)
    $g.DrawImage($img, $x + [int](($W - $aw) / 2), $y + $cab + [int](($H - $ah) / 2), $aw, $ah); $img.Dispose()
  } catch { $g.DrawString("(no descarga)", $f, [System.Drawing.Brushes]::Red, $x + 10, $y + 60) }
}
$g.Dispose()
$out = Join-Path $root $Salida
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
$hoja.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $hoja.Dispose()
"hoja: $out ($($Slugs.Count) fotos)"
